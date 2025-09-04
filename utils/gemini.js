import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function generateReport(profileData) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `Generate a detailed report describing the person based strictly on the following LinkedIn profile data. Do not include any extra statements, introductions, or explanations—only the report itself. Here is the data:

${JSON.stringify(profileData, null, 2)}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}