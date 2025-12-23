const request = require('supertest');
const app = require('../index');
const db = require('./test-db');

// Use o utilitário para gerenciar o banco
beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('🛡️ Auth Security Suite', () => {
  
  const mockUser = {
    firstName: 'Test',
    lastName: 'Lawyer',
    email: 'test@legalmind.com',
    password: 'password123'
  };

  test('POST /api/users/register - Deve criar usuário com dados válidos', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(mockUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(mockUser.email);
  });

  test('POST /api/users/register - Deve BLOQUEAR senha curta (Zod Validation)', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ ...mockUser, password: '123' }); // Senha fraca
    
    expect(res.statusCode).toEqual(400); // Bad Request
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  test('POST /api/users/login - Deve logar com credenciais corretas', async () => {
    // 1. Preparação: Criar o usuário primeiro (pois o afterEach limpou o banco)
    await request(app).post('/api/users/register').send(mockUser);

    // 2. Ação: Tentar logar
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    // 3. Verificação
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/users/login - Deve falhar com senha errada', async () => {
    // Recria usuário para garantir
    await request(app).post('/api/users/register').send(mockUser);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: mockUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
  });
});