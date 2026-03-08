/**
 * Script de Seed (População Inicial do Banco de Dados)
 * 
 * Popula o banco de dados com dados iniciais de teste para facilitar
 * o desenvolvimento e a demonstração do sistema. Cria:
 * - 1 usuário administrador
 * - 1 usuário profissional (médico) com agenda semanal
 * - 1 usuário paciente com cadastro completo
 * - 1 unidade hospitalar
 * - 5 leitos hospitalares
 * 
 * Executar: node prisma/seed.js
 */

require('dotenv').config({ quiet: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configura a conexão com o banco de dados
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Iniciando seed do banco de dados...');

    // Limpa todos os dados existentes (ordem importa por causa das chaves estrangeiras)
    await prisma.auditLog.deleteMany();
    await prisma.notificacao.deleteMany();
    await prisma.prescricao.deleteMany();
    await prisma.exame.deleteMany();
    await prisma.prontuario.deleteMany();
    await prisma.consulta.deleteMany();
    await prisma.agenda.deleteMany();
    await prisma.leito.deleteMany();
    await prisma.paciente.deleteMany();
    await prisma.profissional.deleteMany();
    await prisma.unidadeHospitalar.deleteMany();
    await prisma.usuario.deleteMany();

    console.log('Dados anteriores limpos.');

    // =============================================
    // Cria o usuário administrador do sistema
    // =============================================
    const senhaHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.create({
        data: {
            email: 'admin@vidaplus.com',
            senhaHash,
            perfil: 'ADMIN',
        },
    });
    console.log('Admin criado:', admin.email);

    // =============================================
    // Cria um usuário profissional (médico)
    // =============================================
    const senhaMedico = await bcrypt.hash('medico123', 10);
    const usuarioMedico = await prisma.usuario.create({
        data: {
            email: 'dr.carlos@vidaplus.com',
            senhaHash: senhaMedico,
            perfil: 'PROFISSIONAL',
        },
    });

    // =============================================
    // Cria uma unidade hospitalar
    // =============================================
    const unidade = await prisma.unidadeHospitalar.create({
        data: {
            nome: 'Hospital Central VidaPlus',
            tipo: 'HOSPITAL',
            endereco: 'Av. Principal, 1000 - Centro',
            telefone: '1133334444',
        },
    });
    console.log('Unidade hospitalar criada:', unidade.nome);

    // =============================================
    // Cria o cadastro do profissional (médico cardiologista)
    // =============================================
    const medico = await prisma.profissional.create({
        data: {
            usuarioId: usuarioMedico.id,
            nome: 'Dr. Carlos Mendes',
            registroConselho: 'CRM-SP 123456',
            especialidade: 'Cardiologia',
            tipo: 'MEDICO',
            unidadeId: unidade.id,
        },
    });
    console.log('Profissional criado:', medico.nome);

    // =============================================
    // Cria a agenda semanal do médico (segunda a sexta, 08h-17h)
    // =============================================
    const diasSemana = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'];
    for (const dia of diasSemana) {
        await prisma.agenda.create({
            data: {
                profissionalId: medico.id,
                diaSemana: dia,
                horaInicio: '08:00',
                horaFim: '17:00',
            },
        });
    }
    console.log('Agenda do medico criada (Seg-Sex, 08:00-17:00)');

    // =============================================
    // Cria um usuário paciente
    // =============================================
    const senhaPaciente = await bcrypt.hash('paciente123', 10);
    const usuarioPaciente = await prisma.usuario.create({
        data: {
            email: 'joao.silva@email.com',
            senhaHash: senhaPaciente,
            perfil: 'PACIENTE',
        },
    });

    // Cria o cadastro completo do paciente
    const paciente = await prisma.paciente.create({
        data: {
            usuarioId: usuarioPaciente.id,
            nome: 'Joao Silva',
            cpf: '12345678900',
            dataNasc: new Date('1990-05-15'),
            telefone: '11999998888',
            endereco: 'Rua A, 123 - Sao Paulo/SP',
            sexo: 'M',
        },
    });
    console.log('Paciente criado:', paciente.nome);

    // =============================================
    // Cria leitos hospitalares de diferentes tipos
    // =============================================
    const tiposLeito = [
        { numero: 'UTI-001', tipo: 'UTI', status: 'LIVRE' },
        { numero: 'UTI-002', tipo: 'UTI', status: 'OCUPADO' },
        { numero: 'ENF-001', tipo: 'ENFERMARIA', status: 'LIVRE' },
        { numero: 'ENF-002', tipo: 'ENFERMARIA', status: 'LIVRE' },
        { numero: 'ISO-001', tipo: 'ISOLAMENTO', status: 'MANUTENCAO' },
    ];

    for (const leito of tiposLeito) {
        await prisma.leito.create({
            data: { ...leito, unidadeId: unidade.id },
        });
    }
    console.log('5 leitos criados');

    // Exibe resumo das credenciais de teste
    console.log('\n=== Seed concluido com sucesso! ===');
    console.log('\nCredenciais de teste:');
    console.log('  Admin:     admin@vidaplus.com / admin123');
    console.log('  Medico:    dr.carlos@vidaplus.com / medico123');
    console.log('  Paciente:  joao.silva@email.com / paciente123');
}

// Executa o seed e encerra a conexão ao finalizar
main()
    .catch((e) => {
        console.error('Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
