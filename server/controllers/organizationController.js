const Organization = require('../models/Organization');
const User = require('../models/User');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../services/emailService'); // Poderíamos ter um email de convite específico aqui

// Criar nova organização
const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Verifica se usuário já tem org (Simplificação: 1 user = 1 org por enquanto)
    if (req.user.organization) {
      return res.status(400).json({ message: 'Usuário já pertence a uma organização.' });
    }

    const org = await Organization.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Atualiza o usuário
    const user = await User.findById(req.user._id);
    user.organization = org._id;
    user.organizationRole = 'owner';
    await user.save();

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar organização.' });
  }
};

// Obter dados da organização do usuário
const getMyOrganization = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(404).json({ message: 'Você não possui uma organização.' });
    }

    const org = await Organization.findById(req.user.organization)
      .populate('members.user', 'firstName lastName email avatar');
    
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar organização.' });
  }
};

// Convidar Membro (Gera link ou envia email)
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const orgId = req.user.organization;

    // Apenas admins podem convidar
    if (req.user.organizationRole !== 'owner' && req.user.organizationRole !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão para convidar.' });
    }

    const org = await Organization.findById(orgId);
    
    // Verifica limite de assentos (exemplo)
    if (org.members.length >= org.planLimits.seats) {
      return res.status(403).json({ message: 'Limite de membros atingido. Faça upgrade do plano.' });
    }

    // Gera token de convite
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    org.invitations.push({ email, role, token, expiresAt });
    await org.save();

    // Aqui enviaríamos o email com o link: https://app.legalmind.com/join?token=...
    // Por enquanto, retornamos o token para teste
    res.json({ message: 'Convite criado.', inviteLink: `/join?token=${token}` });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao convidar membro.' });
  }
};

module.exports = { createOrganization, getMyOrganization, inviteMember };