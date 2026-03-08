const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

jest.mock('../../shared/prisma', () => ({
    prontuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
    },
    consulta: {
        findUnique: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    }
}));

describe('Prontuarios Module', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.sign({ id: 'uuid-medico', email: 'medico@teste.com', perfil: 'PROFISSIONAL' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um prontuário com sucesso (201)', async () => {
        // Mock da consulta pertencente ao paciente
        prisma.consulta.findUnique.mockResolvedValue({ id: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2', pacienteId: '8097dd79-7a33-4f51-b8ef-f4d0ed847d06' });
        prisma.prontuario.findUnique.mockResolvedValue(null);
        prisma.prontuario.create.mockResolvedValue({ id: 'pront-1', descricao: 'Teste' });

        const response = await request(app)
            .post('/api/prontuarios')
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                pacienteId: '8097dd79-7a33-4f51-b8ef-f4d0ed847d06',
                consultaId: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2',
                descricao: 'Paciente com febre e dor no corpo',
                diagnostico: 'Gripe'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'pront-1');
    });

    it('deve listar prontuários por paciente (200)', async () => {
        prisma.prontuario.findMany.mockResolvedValue([{ id: 'pront-1' }]);
        prisma.prontuario.count.mockResolvedValue(1);

        const response = await request(app)
            .get('/api/prontuarios/paciente/paciente-1')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(response.status).toBe(200);
        expect(response.body.dados).toHaveLength(1);
    });
});
