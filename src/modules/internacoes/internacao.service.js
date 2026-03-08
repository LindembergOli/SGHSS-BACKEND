/**
 * Service do módulo de Internações
 * 
 * Controla o fluxo completo de internação hospitalar:
 * admissão, acompanhamento e alta médica de pacientes.
 * Gerencia automaticamente o status dos leitos.
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class InternacaoService {
    /**
     * Registra uma nova internação (admissão hospitalar)
     * Vincula paciente a um leito e marca o leito como OCUPADO
     */
    async internar({ pacienteId, leitoId, profissionalId, motivo, diagnostico, observacoes }) {
        // Verifica se o paciente existe
        const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
        if (!paciente) { const e = new Error('Paciente não encontrado.'); e.statusCode = 404; throw e; }

        // Verifica se o leito existe e está disponível
        const leito = await prisma.leito.findUnique({ where: { id: leitoId } });
        if (!leito) { const e = new Error('Leito não encontrado.'); e.statusCode = 404; throw e; }
        if (leito.status !== 'LIVRE') {
            const e = new Error(`Leito indisponível. Status atual: ${leito.status}.`);
            e.statusCode = 400; throw e;
        }

        // Verifica se o profissional existe
        const profissional = await prisma.profissional.findUnique({ where: { id: profissionalId } });
        if (!profissional) { const e = new Error('Profissional não encontrado.'); e.statusCode = 404; throw e; }

        // Verifica se paciente já possui internação ativa
        const internacaoAtiva = await prisma.internacao.findFirst({ where: { pacienteId, status: 'ATIVA' } });
        if (internacaoAtiva) {
            const e = new Error('Este paciente já possui uma internação ativa.');
            e.statusCode = 409; throw e;
        }

        // Cria internação e atualiza status do leito em uma transação
        const internacao = await prisma.$transaction(async (tx) => {
            const novaInternacao = await tx.internacao.create({
                data: { pacienteId, leitoId, profissionalId, motivo, diagnostico: diagnostico || null, observacoes: observacoes || null },
            });

            await tx.leito.update({ where: { id: leitoId }, data: { status: 'OCUPADO' } });

            return novaInternacao;
        });

        logger.info('Internação registrada', { id: internacao.id, pacienteId, leitoId });
        return internacao;
    }

    /**
     * Registra alta médica — libera o leito automaticamente
     */
    async darAlta(id, { diagnostico, observacoes }) {
        const internacao = await prisma.internacao.findUnique({ where: { id } });
        if (!internacao) { const e = new Error('Internação não encontrada.'); e.statusCode = 404; throw e; }
        if (internacao.status !== 'ATIVA') {
            const e = new Error(`Esta internação já foi finalizada com status: ${internacao.status}.`);
            e.statusCode = 400; throw e;
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const atualizada = await tx.internacao.update({
                where: { id },
                data: {
                    status: 'ALTA_MEDICA',
                    dataSaida: new Date(),
                    diagnostico: diagnostico || internacao.diagnostico,
                    observacoes: observacoes || internacao.observacoes,
                },
            });

            await tx.leito.update({ where: { id: internacao.leitoId }, data: { status: 'LIVRE' } });

            return atualizada;
        });

        logger.info('Alta médica registrada', { id, leitoId: internacao.leitoId });
        return resultado;
    }

    /**
     * Lista internações com paginação e filtros
     */
    async listar({ pagina = 1, limite = 10, status, pacienteId }) {
        const where = {};
        if (status) where.status = status;
        if (pacienteId) where.pacienteId = pacienteId;

        const skip = (pagina - 1) * limite;
        const [internacoes, total] = await Promise.all([
            prisma.internacao.findMany({
                where, skip, take: limite,
                orderBy: { dataEntrada: 'desc' },
                include: {
                    paciente: { select: { nome: true, cpf: true } },
                    leito: { select: { numero: true, tipo: true, unidade: { select: { nome: true } } } },
                    profissional: { select: { nome: true, especialidade: true } },
                },
            }),
            prisma.internacao.count({ where }),
        ]);

        return { dados: internacoes, paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) } };
    }

    /**
     * Busca internação por ID com dados completos
     */
    async buscarPorId(id) {
        const internacao = await prisma.internacao.findUnique({
            where: { id },
            include: {
                paciente: { select: { id: true, nome: true, cpf: true, telefone: true } },
                leito: { include: { unidade: { select: { nome: true, tipo: true } } } },
                profissional: { select: { id: true, nome: true, especialidade: true, registroConselho: true } },
            },
        });
        if (!internacao) { const e = new Error('Internação não encontrada.'); e.statusCode = 404; throw e; }
        return internacao;
    }
}

module.exports = new InternacaoService();
