const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

jest.mock('../../shared/prisma', () => ({
    prescricao: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
    consulta: {
        findUnique: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    }
}));

describe('Prescricoes Module', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.sign({ id: 'uuid-medico', email: 'medico@teste.com', perfil: 'PROFISSIONAL' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve emitir uma prescrição com sucesso (201)', async () => {
        prisma.consulta.findUnique.mockResolvedValue({ id: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2' });
        prisma.prescricao.create.mockResolvedValue({ id: 'presc-1' });

        const response = await request(app)
            .post('/api/prescricoes')
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                consultaId: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2',
                medicamento: 'Dipirona 500mg',
                dosagem: '1 comprimido de 8 em 8 horas'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'presc-1');
    });

    it('deve listar prescricoes (200)', async () => {
        prisma.prescricao.findMany.mockResolvedValue([{ id: 'presc-1' }]);
        prisma.prescricao.count.mockResolvedValue(1);

        const response = await request(app)
            .get('/api/prescricoes')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(response.status).toBe(200);
        expect(response.body.dados).toHaveLength(1);
    });
});
