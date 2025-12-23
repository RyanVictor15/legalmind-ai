const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Structured Prompt for Legal Analysis
    const prompt = `
      Role: Senior Legal Analyst.
      Task: Analyze the provided legal document text and output a JSON response.
      Context: The user is a lawyer needing a quick overview.
      
      Document Name: ${filename}
      Text Content: "${text.substring(0, 15000)}" 
      // Note: Truncated to safe token limit.

      Output Format (Strict JSON):
      {
        "summary": "Concise paragraph summarizing the case/document",
        "riskScore": 0-100 (integer, where 100 is high success probability for the client),
        "verdict": "Favorable" | "Unfavorable" | "Neutral",
        "keywords": {
           "positive": ["list", "of", "good", "points"],
           "negative": ["list", "of", "bad", "points"]
        },
        "strategicAdvice": "One actionable strategic advice paragraph"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    // Try to parse JSON from AI response (AI can sometimes wrap in markdown code blocks)
    const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if AI fails to return JSON
    return {
        summary: textOutput,
        riskScore: 50,
        verdict: "Neutral",
        keywords: { positive: [], negative: [] },
        strategicAdvice: "Review document manually."
    };

  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate AI analysis.");
  }
};

module.exports = { generateLegalAnalysis };