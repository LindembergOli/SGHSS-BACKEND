const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma'); // Será mockado
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

// Mock do prisma
jest.mock('../../shared/prisma', () => ({
    consulta: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
    },
    paciente: {
        findUnique: jest.fn(),
    },
    profissional: {
        findUnique: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    }
}));

describe('Consultas Module', () => {
    let mockToken;

    beforeAll(() => {
        // Gera um token falso de RECEPCIONISTA/ADMIN para os testes
        mockToken = jwt.sign({ id: 'uuid-admin', email: 'admin@teste.com', perfil: 'ADMIN' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/consultas', () => {
        it('deve agendar uma consulta com sucesso (201)', async () => {
            // Mock do paciente e profissional existindo
            prisma.paciente.findUnique.mockResolvedValue({ id: 'p-1', nome: 'Paciente 1' });
            prisma.profissional.findUnique.mockResolvedValue({ id: 'prof-1', nome: 'Profissional 1' });

            // Mock sem conflito de agenda
            prisma.consulta.findFirst.mockResolvedValue(null);

            // Mock do banco salvando
            prisma.consulta.create.mockResolvedValue({
                id: 'uuid-consulta',
                pacienteId: 'p-1',
                profissionalId: 'prof-1',
                dataHora: '2026-03-01T10:00:00.000Z',
                tipo: 'PRESENCIAL',
                status: 'AGENDADA'
            });

            const response = await request(app)
                .post('/api/consultas')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    pacienteId: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2',
                    profissionalId: 'ebae6066-5de0-410a-bb73-4fde764e5aa9',
                    dataHora: '2026-03-01T10:00:00.000Z',
                    tipo: 'PRESENCIAL'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 'uuid-consulta');
        });

        it('deve falhar se houver conflito de horário (409)', async () => {
            // Mock de recursos e conflito
            prisma.paciente.findUnique.mockResolvedValue({ id: 'p-1' });
            prisma.profissional.findUnique.mockResolvedValue({ id: 'prof-1' });
            prisma.consulta.findFirst.mockResolvedValue({ id: 'conflito' });

            const response = await request(app)
                .post('/api/consultas')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    pacienteId: '355e0c52-78d9-4d37-814d-fa7ed9dfbad2',
                    profissionalId: 'ebae6066-5de0-410a-bb73-4fde764e5aa9',
                    dataHora: '2026-03-01T10:00:00.000Z'
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('erro', 'Já existe uma consulta agendada para este profissional neste horário.');
        });
    });

    describe('PATCH /api/consultas/:id/cancelar', () => {
        it('deve cancelar a consulta (200)', async () => {
            const idMock = 'uuid-consulta-cancelar';
            // Mock consulta encontrada
            prisma.consulta.findUnique.mockResolvedValue({
                id: idMock,
                status: 'AGENDADA'
            });
            // Mock atualização
            prisma.consulta.update.mockResolvedValue({
                id: idMock,
                status: 'CANCELADA'
            });

            const response = await request(app)
                .patch(`/api/consultas/${idMock}/cancelar`)
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'CANCELADA');
        });

        it('não deve cancelar consulta já cancelada (400)', async () => {
            prisma.consulta.findUnique.mockResolvedValue({
                id: 'uuid-qualquer',
                status: 'CANCELADA'
            });

            const response = await request(app)
                .patch(`/api/consultas/uuid-qualquer/cancelar`)
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('erro', 'Esta consulta já foi cancelada.');
        });
    });
});
