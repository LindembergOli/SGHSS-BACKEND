/**
 * Service do módulo de Prontuários
 * 
 * Contém a lógica de negócio para criação, consulta e atualização
 * de prontuários médicos (registros clínicos) vinculados a consultas.
 * Cada consulta pode ter no máximo um prontuário.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class ProntuarioService {
    /**
     * Cria um novo prontuário vinculado a uma consulta e paciente
     * Verifica se a consulta existe, pertence ao paciente e se já não há prontuário
     */
    async criar({ pacienteId, consultaId, descricao, diagnostico }) {
        // Verifica se a consulta existe
        const consulta = await prisma.consulta.findUnique({ where: { id: consultaId } });
        if (!consulta) { const e = new Error('Consulta não encontrada.'); e.statusCode = 404; throw e; }

        // Verifica se a consulta pertence ao paciente informado
        if (consulta.pacienteId !== pacienteId) {
            const e = new Error('A consulta não pertence a este paciente.'); e.statusCode = 400; throw e;
        }

        // Verifica se já existe prontuário para esta consulta (relação 1:1)
        const existente = await prisma.prontuario.findUnique({ where: { consultaId } });
        if (existente) { const e = new Error('Já existe um prontuário para esta consulta.'); e.statusCode = 409; throw e; }

        // Cria o prontuário no banco de dados
        const prontuario = await prisma.prontuario.create({
            data: { pacienteId, consultaId, descricao, diagnostico: diagnostico || null },
        });
        logger.info('Prontuário criado', { id: prontuario.id });
        return prontuario;
    }

    /**
     * Lista o histórico de prontuários de um paciente com paginação
     * Inclui os dados da consulta e do profissional que atendeu
     */
    async listarPorPaciente(pacienteId, { pagina = 1, limite = 10 }) {
        const skip = (pagina - 1) * limite;

        // Executa consulta e contagem em paralelo
        const [prontuarios, total] = await Promise.all([
            prisma.prontuario.findMany({
                where: { pacienteId }, skip, take: limite,
                orderBy: { data: 'desc' },
                include: { consulta: { select: { dataHora: true, profissional: { select: { nome: true, especialidade: true } } } } },
            }),
            prisma.prontuario.count({ where: { pacienteId } }),
        ]);
        return { dados: prontuarios, paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } };
    }

    /**
     * Busca um prontuário por ID com dados do paciente e profissional
     */
    async buscarPorId(id) {
        const prontuario = await prisma.prontuario.findUnique({
            where: { id },
            include: {
                paciente: { select: { nome: true, cpf: true } },
                consulta: { include: { profissional: { select: { nome: true, especialidade: true } } } },
            },
        });
        if (!prontuario) { const e = new Error('Prontuário não encontrado.'); e.statusCode = 404; throw e; }
        return prontuario;
    }

    /**
     * Atualiza a descrição ou diagnóstico de um prontuário existente
     */
    async atualizar(id, dados) {
        // Verifica se o prontuário existe antes de atualizar
        await this.buscarPorId(id);
        return prisma.prontuario.update({ where: { id }, data: dados });
    }
}

module.exports = new ProntuarioService();
