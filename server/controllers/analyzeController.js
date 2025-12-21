const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
// Security: API Key must be in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeDocument = async (req, res) => {
  let filePath = null;

  try {
    // 1. Validate Upload
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
    }

    filePath = req.file.path;
    let extractedText = '';

    // 2. Extract Text based on Mime Type
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      // Fallback for unsupported types that bypassed multer (rare)
      throw new Error('Unsupported file type processing.');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Extracted text is empty.');
    }

    // 3. AI Analysis (Gemini)
    // Use a lighter model for speed, or Pro for reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a specialized legal assistant (LegalMind AI).
      Analyze the following legal document text and provide a structured summary in JSON format:
      1. Case Summary (Brief overview)
      2. Key Arguments (List of main points)
      3. Success Probability (Estimate 0-100% based on text tone/facts)
      4. Recommended Actions (Bullet points)
      
      Document Text:
      "${extractedText.substring(0, 10000)}" 
      // Truncated to 10k chars to avoid token limits
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // 4. Send Response
    res.json({
      status: 'success',
      data: {
        analysis: analysisText, // AI output
        metadata: {
          filename: req.file.originalname,
          size: req.file.size
        }
      }
    });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error processing document.' 
    });

  } finally {
    // 5. CLEANUP: Delete file after processing to save space
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted temp file: ${filePath}`);
      } catch (err) {
        console.error(`⚠️ Failed to delete file: ${filePath}`, err);
      }
    }
  }
};

module.exports = { analyzeDocument };