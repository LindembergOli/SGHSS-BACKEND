const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

jest.mock('../../shared/prisma', () => ({
    exame: {
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

describe('Exames Module', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.sign({ id: 'uuid-medico', email: 'medico@teste.com', perfil: 'PROFISSIONAL' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve solicitar um exame com sucesso (201)', async () => {
        prisma.consulta.findUnique.mockResolvedValue({ id: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2' });
        prisma.exame.create.mockResolvedValue({ id: 'exame-1', status: 'SOLICITADO' });

        const response = await request(app)
            .post('/api/exames')
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                consultaId: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2',
                tipo: 'Sangue'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'exame-1');
    });

    it('deve registrar resultado de exame (200)', async () => {
        prisma.exame.findUnique.mockResolvedValue({ id: 'exame-1' });
        prisma.exame.update.mockResolvedValue({ id: 'exame-1', status: 'RESULTADO_DISPONIVEL' });

        const response = await request(app)
            .patch('/api/exames/exame-1/resultado')
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                resultado: 'Nenhum problema detectado.'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'RESULTADO_DISPONIVEL');
    });
});
