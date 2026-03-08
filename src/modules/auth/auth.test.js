const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma'); // Será mockado
const bcrypt = require('bcryptjs');

// Mock do módulo prisma para não tocar no banco real
jest.mock('../../shared/prisma', () => ({
    usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
}));

describe('Auth Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('deve registrar um novo usuário com sucesso', async () => {
            // Mock: não encontra usuário com o e-mail
            prisma.usuario.findUnique.mockResolvedValue(null);

            // Mock: cria e retorna o usuário mockado
            const mockUser = {
                id: 'uuid-123',
                email: 'teste@teste.com',
                perfil: 'PACIENTE',
                ativo: true,
                createdAt: new Date().toISOString(),
            };
            prisma.usuario.create.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'teste@teste.com',
                    senha: 'senha-valida123',
                    perfil: 'PACIENTE',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 'uuid-123');
            expect(response.body).toHaveProperty('email', 'teste@teste.com');
            expect(prisma.usuario.create).toHaveBeenCalledTimes(1);
        });

        it('deve falhar se o e-mail já estiver cadastrado (409)', async () => {
            // Mock: retorna que o usuário já existe
            prisma.usuario.findUnique.mockResolvedValue({ id: 'uuid-existente' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'existente@teste.com',
                    senha: 'qualquersenha',
                    perfil: 'PACIENTE',
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('erro', 'E-mail já cadastrado.');
            expect(prisma.usuario.create).not.toHaveBeenCalled();
        });

        it('deve falhar com dados inválidos (400)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'email-invalido', // Errado
                    senha: '123', // Muito curta
                    perfil: 'INVALIDO', // Inválido
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('erro', 'Dados inválidos.');
            expect(response.body.detalhes.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/auth/login', () => {
        it('deve logar com sucesso e retornar token (200)', async () => {
            const senhaHash = await bcrypt.hash('minhasenha123', 10);
            // Mock do usuário existente no banco
            prisma.usuario.findUnique.mockResolvedValue({
                id: 'uuid-123',
                email: 'valido@teste.com',
                senhaHash: senhaHash,
                perfil: 'PACIENTE',
                ativo: true,
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'valido@teste.com',
                    senha: 'minhasenha123',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.usuario).toHaveProperty('email', 'valido@teste.com');
        });

        it('deve falhar com senha incorreta (401)', async () => {
            const senhaHash = await bcrypt.hash('minhasenha123', 10);
            prisma.usuario.findUnique.mockResolvedValue({
                id: 'uuid-123',
                email: 'valido@teste.com',
                senhaHash: senhaHash,
                perfil: 'PACIENTE',
                ativo: true,
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'valido@teste.com',
                    senha: 'senhaerrada',
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('erro', 'E-mail ou senha incorretos.');
        });
    });
});
