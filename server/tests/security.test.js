const request = require('supertest'); // AQUI ESTAVA O ERRO (cconst)
const app = require('../index');
const db = require('./test-db'); 

let token;

beforeAll(async () => {
  await db.connect(); 
  
  // Cria usuário para teste
  await request(app).post('/api/users/register').send({
      firstName: 'Sec', lastName: 'Tester', email: 'sec@test.com', password: 'password123'
  });
  
  // Loga para pegar token
  const res = await request(app).post('/api/users/login').send({
    email: 'sec@test.com',
    password: 'password123'
  });
  token = res.body.token;
});

afterAll(async () => await db.close());

describe('⚔️ Penetration Testing (Automated)', () => {

  test('GET /api/jurisprudence - Deve neutralizar NoSQL Injection', async () => {
    const res = await request(app)
      .get('/api/jurisprudence?search[$ne]=something') 
      .set('Authorization', `Bearer ${token}`);

    // Não deve quebrar o servidor (500)
    expect(res.statusCode).not.toBe(500);
  });

  test('XSS Protection - Headers de Segurança (Helmet)', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

});