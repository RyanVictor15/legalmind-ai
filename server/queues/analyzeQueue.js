const { Queue } = require('bullmq');
const connection = require('../config/redis');

const analyzeQueue = new Queue('analyze-queue', { connection });

module.exports = analyzeQueue;