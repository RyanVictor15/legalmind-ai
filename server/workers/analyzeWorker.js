const { Worker } = require('bullmq');
const connection = require('../config/redis');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const User = require('../models/User');
const { generateLegalAnalysis } = require('../services/aiService');
const { sendAnalysisNotification } = require('../services/emailService');
const { createNotification } = require('../controllers/notificationController');

const worker = new Worker('analyze-queue', async (job) => {
  const { filePath, originalName, userId, mimetype } = job.data;
  console.log(`⚙️ Worker: Processando job ${job.id} para usuário ${userId}`);

  try {
    // 1. LER ARQUIVO (Ainda precisamos ler do disco)
    // Nota: Em produção com Docker/K8s, idealmente usaríamos S3. 
    // Aqui assumimos disco local compartilhado.
    let textContent = '';
    
    if (mimetype === 'application/pdf') {
       const dataBuffer = fs.readFileSync(filePath);
       const pdfData = await pdfParse(dataBuffer);
       textContent = pdfData.text;
    } else {
       textContent = fs.readFileSync(filePath, 'utf-8');
    }

    textContent = textContent.replace(/\n\s*\n/g, '\n');

    // 2. IA (Pesado)
    const analysis = await generateLegalAnalysis(textContent, originalName);

    // 3. SALVAR NO BANCO
    const newDoc = await Document.create({
        user: userId,
        filename: originalName,
        originalContent: textContent.substring(0, 5000),
        summary: analysis.summary,
        riskScore: analysis.riskScore,
        verdict: analysis.verdict,
        strategicAdvice: analysis.strategicAdvice,
        keywords: analysis.keywords
    });

    // 4. ATUALIZAR CONTAGEM DE USO (Se Free)
    const user = await User.findById(userId);
    if (user && !user.isPro) {
      user.usageCount += 1;
      await user.save();
    }

    // 5. NOTIFICAR (Sucesso)
    // Email
    await sendAnalysisNotification(user.email, user.firstName, originalName);
    
    // In-App
    await createNotification(
      userId,
      'Análise Pronta',
      `O documento "${originalName}" foi processado.`,
      'success',
      '/history'
    );

    console.log(`✅ Job ${job.id} concluído.`);
    return newDoc;

  } catch (error) {
    console.error(`❌ Job ${job.id} falhou:`, error);
    
    // Notificar erro
    await createNotification(
      userId,
      'Falha na Análise',
      `Não foi possível processar "${originalName}". Tente novamente.`,
      'error'
    );
    
    throw error;
  } finally {
    // Limpeza do arquivo temporário
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) { console.error('Erro cleanup worker:', e); }
  }

}, { connection });

module.exports = worker;