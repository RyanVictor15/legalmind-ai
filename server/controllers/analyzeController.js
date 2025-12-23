const fs = require('fs');
const pdf = require('pdf-parse');
const Document = require('../models/Document');
const { generateLegalAnalysis } = require('../services/aiService');

// @desc    Analyze Document with AI
// @route   POST /api/analyze
// @access  Protected
const analyzeDocument = async (req, res) => {
  let filePath = null;

  try {
    // 1. Validate Upload
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
    }
    filePath = req.file.path;

    // 2. Extract Text
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else {
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    if (!extractedText.trim()) {
      throw new Error('Document appears to be empty or unreadable.');
    }

    // 3. Call AI Service (Business Logic)
    const analysisResult = await generateLegalAnalysis(extractedText, req.file.originalname);

    // 4. Save to Database (Persistence)
    const newDoc = await Document.create({
      userId: req.user._id,
      filename: req.file.originalname,
      filePath: filePath, // Keeping local path for history download
      originalText: extractedText.substring(0, 1000), // Save only preview
      
      // AI Data
      aiSummary: analysisResult.summary,
      riskAnalysis: analysisResult.riskScore,
      verdict: analysisResult.verdict,
      keywords: analysisResult.keywords,
      strategicAdvice: analysisResult.strategicAdvice
    });

    // 5. Response
    res.json({
      status: 'success',
      data: newDoc
    });

  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error processing document.' 
    });
  } finally {
    // Cleanup: We keep the file for "Download Original" feature, 
    // BUT in production, you should upload to S3/Cloud Storage and delete local.
    // For this MVP, we keep it. 
    // fs.unlinkSync(filePath); <--- Commented out for MVP History feature
  }
};

module.exports = { analyzeDocument };