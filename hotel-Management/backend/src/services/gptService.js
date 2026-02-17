// src/services/gptService.js



// import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY, // .env file la secret store
// });

// const openai = new OpenAIApi(configuration);

// export const askGPT = async (userMessage) => {
//   try {
//     const completion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo", // or "gpt-4" if you have access
//       messages: [
//         { role: "system", content: "You are a helpful assistant for hotel guests." },
//         { role: "user", content: userMessage },
//       ],
//     });

//     return completion.data.choices[0].message.content.trim();
//   } catch (error) {
//     console.error("OpenAI API error:", error.response?.data || error.message);
//     throw new Error("Failed to get response from AI");
//   }
// };
