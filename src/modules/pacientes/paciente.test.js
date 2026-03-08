const request = require('supertest');
const app = require('../../app');
const prisma = require('../../shared/prisma'); // Será mockado
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/auth');

// Mock do prisma
jest.mock('../../shared/prisma', () => ({
    paciente: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
}));

describe('Pacientes Module', () => {
    let mockToken;

    beforeAll(() => {
        // Gera um token falso de ADMIN para os testes
        mockToken = jwt.sign({ id: 'uuid-admin', email: 'admin@teste.com', perfil: 'ADMIN' }, jwtSecret, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/pacientes', () => {
        it('deve cadastrar um novo paciente (201)', async () => {
            prisma.paciente.findUnique.mockResolvedValue(null); // Sem conflitos
            const mockPaciente = {
                id: 'uuid-paciente',
                usuarioId: 'uuid-admin',
                nome: 'João da Silva',
                cpf: '12345678900',
                dataNasc: '1990-05-15T00:00:00.000Z',
                telefone: '11999998888',
                endereco: 'Rua A, 123',
                sexo: 'M'
            };
            prisma.paciente.create.mockResolvedValue(mockPaciente);

            const response = await request(app)
                .post('/api/pacientes')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    nome: 'João da Silva',
                    cpf: '12345678900',
                    dataNasc: '1990-05-15',
                    telefone: '11999998888',
                    endereco: 'Rua A, 123',
                    sexo: 'M'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 'uuid-paciente');
            expect(prisma.paciente.create).toHaveBeenCalledTimes(1);
        });

        it('deve barrar requisição sem token (401)', async () => {
            const response = await request(app)
                .post('/api/pacientes')
                .send({ nome: 'Teste' }); // Faltam campos, mas vai cair no auth antes

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('erro', 'Token não fornecido.');
        });
    });

    describe('GET /api/pacientes', () => {
        it('deve listar pacientes com paginação (200)', async () => {
            prisma.paciente.findMany.mockResolvedValue([
                { id: '1', nome: 'Paciente A' },
                { id: '2', nome: 'Paciente B' },
            ]);
            prisma.paciente.count.mockResolvedValue(2);

            const response = await request(app)
                .get('/api/pacientes?pagina=1&limite=10')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body.dados).toHaveLength(2);
            expect(response.body.paginacao).toHaveProperty('total', 2);
        });
    });

    describe('GET /api/pacientes/:id', () => {
        it('deve retornar dados do paciente (200)', async () => {
            const idMock = '355e0c52-78d9-4d37-814d-fa7ed9dfbad2'; // uuid válido
            prisma.paciente.findUnique.mockResolvedValue({ id: idMock, nome: 'Paciente Encontrado' });

            const response = await request(app)
                .get(`/api/pacientes/${idMock}`)
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('nome', 'Paciente Encontrado');
        });

        it('deve retornar 404 se paciente não existir', async () => {
            const idMock = '355e0c52-78d9-4d37-814d-fa7ed9dfbad2';
            prisma.paciente.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .get(`/api/pacientes/${idMock}`)
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('erro', 'Paciente não encontrado.');
        });
    });
});
