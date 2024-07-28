const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function askGemini() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: ""},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("");
  console.log(result.response.text());
}