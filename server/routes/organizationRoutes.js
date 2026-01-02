const express = require('express');
const router = express.Router();
const { createOrganization, getMyOrganization, inviteMember } = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');

// Middleware Zod (se quiser validar o body, recomendado)
// const validateRequest = require('../middleware/validateRequest');
// const { createOrgSchema } = require('../schemas/orgSchemas'); 

router.post('/', protect, createOrganization);
router.get('/me', protect, getMyOrganization);
router.post('/invite', protect, inviteMember);

module.exports = router;