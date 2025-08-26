const { Client, Databases, ID } = require("node-appwrite");
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

const ENGLISH_DEFAULTS = {
  introTitle: "Welcome to the survey",
  introDescription:
    "We value your time — please take a few minutes to complete this survey.",
  introButtonText: "Get Started",
  outroTitle: "Thank you for your time",
  outroDescription: "Your responses have been submitted successfully.",
  outroButtonText: "Submit",
};

async function updateArabic() {
  if (!DATABASE_ID || !FORMS_COLLECTION_ID) {
    console.error(
      "Missing env variables NEXT_PUBLIC_APPWRITE_DATABASE_ID or NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID"
    );
    process.exit(1);
  }

  try {
    let offset = 0;
    const limit = 50;
    let updates = 0;

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
        const updateData = {};
        for (const [key, val] of Object.entries(ENGLISH_DEFAULTS)) {
          const existing = doc[key];
          if (typeof existing === "string" && ARABIC_REGEX.test(existing)) {
            updateData[key] = val;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            FORMS_COLLECTION_ID,
            doc.$id,
            updateData
          );
          console.log(
            `Updated doc ${doc.$id}: replaced ${Object.keys(updateData).join(
              ", "
            )}`
          );
          updates++;
        }
      }

      offset += docs.length;
      if (docs.length < limit) break;
    }

    console.log(`Completed. Total documents updated: ${updates}`);
  } catch (e) {
    console.error("Error updating Appwrite:", e.message || e);
    process.exit(1);
  }
}

updateArabic();
