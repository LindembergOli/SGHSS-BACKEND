const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

jest.mock('../../shared/prisma', () => ({
    profissional: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    agenda: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    }
}));

describe('Profissionais Module', () => {
    let mockToken;

    beforeAll(() => {
        mockToken = jwt.sign({ id: 'uuid-admin', email: 'admin@teste.com', perfil: 'ADMIN' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve cadastrar um novo profissional (201)', async () => {
        prisma.profissional.findUnique.mockResolvedValue(null);
        prisma.profissional.create.mockResolvedValue({ id: 'prof-1' });

        const response = await request(app)
            .post('/api/profissionais')
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                nome: 'Dr. Teste',
                registroConselho: 'CRM 123',
                especialidade: 'Cardiologia',
                tipo: 'MEDICO'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', 'prof-1');
    });

    it('deve listar profissionais (200)', async () => {
        prisma.profissional.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
        prisma.profissional.count.mockResolvedValue(2);

        const response = await request(app)
            .get('/api/profissionais')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(response.status).toBe(200);
        expect(response.body.dados).toHaveLength(2);
    });

    it('deve listar as agendas de um profissional (200)', async () => {
        prisma.profissional.findUnique.mockResolvedValue({ id: 'prof-1' });
        prisma.agenda.findMany.mockResolvedValue([{ id: 'agenda-1', diaSemana: 'SEGUNDA' }]);

        const response = await request(app)
            .get('/api/profissionais/prof-1/agendas')
            .set('Authorization', `Bearer ${mockToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });
});
