const { z } = require('zod');

const validateRequest = (schema) => (req, res, next) => {
  try {
    // Tenta validar o corpo da requisição contra o schema
    schema.parse(req.body);
    next(); // Se passou, segue para o controller
  } catch (error) {
    // Se falhar, formata o erro para o frontend entender
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({ 
        message: 'Dados inválidos.',
        errors: formattedErrors 
      });
    }
    
    // Erro genérico
    return res.status(400).json({ message: 'Erro de validação.' });
  }
};

module.exports = validateRequest;