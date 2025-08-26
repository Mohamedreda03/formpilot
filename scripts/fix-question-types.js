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

async function fixQuestionTypes() {
  if (!DATABASE_ID || !FORMS_COLLECTION_ID) {
    console.error("Missing env variables");
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
        const questionsStr = doc.questions;
        if (typeof questionsStr === "string") {
          try {
            const questions = JSON.parse(questionsStr);
            let modified = false;

            const updatedQuestions = questions.map((q) => {
              if (q.type === "short-answer") {
                modified = true;
                return { ...q, type: "text" };
              }
              return q;
            });

            if (modified) {
              await databases.updateDocument(
                DATABASE_ID,
                FORMS_COLLECTION_ID,
                doc.$id,
                {
                  questions: JSON.stringify(updatedQuestions),
                }
              );
              console.log(`Updated doc ${doc.$id}: fixed question types`);
              updates++;
            }
          } catch (e) {
            console.log(`Skipped doc ${doc.$id}: invalid questions JSON`);
          }
        }
      }

      offset += docs.length;
      if (docs.length < limit) break;
    }

    console.log(`Completed. Total documents updated: ${updates}`);
  } catch (e) {
    console.error("Error:", e.message || e);
    process.exit(1);
  }
}

fixQuestionTypes();
