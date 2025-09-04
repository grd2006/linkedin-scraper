import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function generateReport(profileData) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `Generate a professional and detailed report describing the person strictly based on the following LinkedIn profile data.

Report requirements:

1. "Summarize the person’s profile in a clear, narrative style. Use paragraphs to describe their professional background, education, experience, and interests."

2. "Highlight the most important points (like key skills, notable achievements, or current role) using bullet points."

3. "Avoid including extra statements, introductions, or explanations beyond the report."

4. "Maintain professional language suitable for a LinkedIn summary or professional dossier."

5. "Format the report using appropriate Markdown syntax (bold for section headings and key details, bullet points for lists where appropriate)."

Here is the data:

${JSON.stringify(profileData, null, 2)}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}