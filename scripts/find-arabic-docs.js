const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const FORMS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID;

const ARABIC_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

async function findArabic() {
  if (!DATABASE_ID || !FORMS_COLLECTION_ID) {
    console.error(
      "Missing env variables NEXT_PUBLIC_APPWRITE_DATABASE_ID or NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID"
    );
    process.exit(1);
  }

  try {
    let offset = 0;
    const limit = 50;
    let found = [];

    while (true) {
      const res = await databases.listDocuments(
        DATABASE_ID,
        FORMS_COLLECTION_ID,
        [],
        offset,
        limit
      );
      const docs = res.documents || [];
      if (docs.length === 0) break;

      for (const doc of docs) {
        const fieldsToCheck = [
          "introTitle",
          "introDescription",
          "outroTitle",
          "outroDescription",
          "title",
          "description",
        ];
        for (const key of fieldsToCheck) {
          const val = doc[key];
          if (typeof val === "string" && ARABIC_REGEX.test(val)) {
            found.push({ id: doc.$id, key, value: val });
          }
        }
      }

      offset += docs.length;
      if (docs.length < limit) break;
    }

    if (found.length === 0) {
      console.log("No Arabic text found in forms collection documents.");
    } else {
      console.log("Arabic content found in the following documents:");
      for (const f of found) {
        console.log(
          `- docId=${f.id} field=${f.key} value="${f.value.substring(0, 120)}${
            f.value.length > 120 ? "..." : ""
          }"`
        );
      }
    }
  } catch (e) {
    console.error("Error querying Appwrite:", e.message || e);
    process.exit(1);
  }
}

findArabic();
