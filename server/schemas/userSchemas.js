const { z } = require('zod');

// Schema para REGISTRO
const registerSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

// Schema para LOGIN
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});

// Schema para ONBOARDING
const onboardingSchema = z.object({
  role: z.enum(['Advogado(a)', 'Estudante', 'Paralegal / Assistente'], {
    errorMap: () => ({ message: "Cargo inválido" })
  }),
  specialty: z.string().min(3, "Especialidade obrigatória"),
  mainGoal: z.string().min(3, "Objetivo obrigatório")
});

module.exports = { registerSchema, loginSchema, onboardingSchema };