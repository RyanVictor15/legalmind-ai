const Notification = require('../models/Notification');

// Listar notificações do usuário
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20); // Traz as últimas 20
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar notificações.' });
  }
};

// Marcar como lida
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada.' });
    }

    // Garante que a notificação pertence ao usuário logado
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificação.' });
  }
};

// Marcar todas como lidas
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar notificações.' });
  }
};

// Função interna para criar notificação (para ser usada por outros controllers)
const createNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (error) {
    console.error('Erro ao criar notificação interna:', error);
  }
};

module.exports = { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  createNotification // Exporta para uso interno
};