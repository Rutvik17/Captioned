require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-admin.json");

const fs = require('fs');
const os = require('os');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.MY_FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.MY_FIREBASE_DATABASE_URL,
});

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

function getStorage() {
    return admin.storage();
}

function getDatabase() {
    return admin.database();
}

const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 32,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
};

async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

async function waitForFilesActive(files) {
    console.log("Waiting for file processing...");
    for (const name of files.map((file) => file.name)) {
        let file = await fileManager.getFile(name);
        while (file.state === "PROCESSING") {
            process.stdout.write(".")
            await new Promise((resolve) => setTimeout(resolve, 10_000));
            file = await fileManager.getFile(name)
        }
        if (file.state !== "ACTIVE") {
            throw Error(`File ${file.name} failed to process`);
        }
    }
    console.log("...all files ready\n");
}

async function makeFilePublic(mediaUrl) {
    await getStorage().bucket().file(mediaUrl).makePublic();
    const publicUrl = `https://storage.googleapis.com/${getStorage().bucket().name}/${mediaUrl}`;
    return publicUrl;
}

async function uploadAndProcessMedia(mediaUrl, prompt) {
    try {
        const [metadata] = await getStorage().bucket().file(mediaUrl).getMetadata();

        const tempFilePath = path.join(os.tmpdir(), path.basename(mediaUrl));

        // Check if the file exists in the bucket
        const [exists] = await getStorage().bucket().file(mediaUrl).exists();
        if (!exists) {
            throw new Error('File does not exist in Firebase Storage');
        }
    
        await getStorage().bucket().file(mediaUrl).download({ destination: tempFilePath });
    
        const uploadedFile = await uploadToGemini(tempFilePath, metadata.contentType);

        await waitForFilesActive([uploadedFile]);
    
        if (!fs.existsSync(tempFilePath)) {
            throw new Error('File was not downloaded');
        }
    
        const parts = [
            { text: prompt },
            {
                fileData: {
                    mimeType: uploadedFile.mimeType,
                    fileUri: uploadedFile.uri
                },
            },
        ];
    
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
        });
    
        fs.unlinkSync(tempFilePath);

        const publicUrl = await makeFilePublic(mediaUrl);

        return { content: result.response.text(), publicUrl: publicUrl };
    } catch (error) {
        console.error('Error processing media:', error);
    }
}
  
exports.generateMediaCaptions = functions.https.onCall(async (data, context) => {
    try {
        const mediaUrl = data.path;
        const prompt = data.prompt;
        if (!mediaUrl || !prompt) {
            throw new Error('Media URL and prompt must be provided');
        }
        return await uploadAndProcessMedia(mediaUrl, prompt);
    } catch (error) {
        console.error('Error in function:', error);
        throw new functions.https.HttpsError('internal', 'Error processing media');
    }
});

exports.writeDb = functions.https.onCall(async (data) => {
    try {
        await getDatabase().ref('posts/').push({
           mediaUrl: data.mediaUrl,
           content: data.content,
           timestamp: admin.database.ServerValue.TIMESTAMP
       });
   } catch (error) {
       console.error(error, 'error writing to firestore');
   } 
});

exports.readDb = functions.https.onCall(async () => {
    try {
        const ref = getDatabase().ref('posts');
        const snapshot = await ref.once('value');
        const result = snapshot.val();
        return { data: result.data };
    } catch (error) {
        console.error('Error reading data from database:', error);
        throw new functions.https.HttpsError('internal', 'Unable to read data from database.');
    }
});
  