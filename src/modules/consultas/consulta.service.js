/**
 * Service do módulo de Consultas
 * 
 * Contém a lógica de negócio para agendamento, listagem,
 * cancelamento e realização de consultas médicas.
 * Suporta consultas presenciais e online (telemedicina).
 */

const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class ConsultaService {
    /**
     * Agenda uma nova consulta entre um paciente e um profissional
     * Verifica se ambos existem e se não há conflito de horário
     */
    async agendar({ pacienteId, profissionalId, dataHora, tipo, observacoes }) {
        // Verifica se o paciente existe no sistema
        const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
        if (!paciente) { const e = new Error('Paciente não encontrado.'); e.statusCode = 404; throw e; }

        // Verifica se o profissional existe no sistema
        const profissional = await prisma.profissional.findUnique({ where: { id: profissionalId } });
        if (!profissional) { const e = new Error('Profissional não encontrado.'); e.statusCode = 404; throw e; }

        // Verifica se já existe uma consulta ativa neste horário para o profissional
        const conflito = await prisma.consulta.findFirst({
            where: {
                profissionalId,
                dataHora: new Date(dataHora),
                status: { not: 'CANCELADA' },
            },
        });
        if (conflito) {
            const e = new Error('Já existe uma consulta agendada para este profissional neste horário.');
            e.statusCode = 409; throw e;
        }

        // Cria a consulta no banco com os dados relacionados
        const consulta = await prisma.consulta.create({
            data: {
                pacienteId, profissionalId,
                dataHora: new Date(dataHora),
                tipo: tipo || 'PRESENCIAL',
                observacoes: observacoes || null,
            },
            include: {
                paciente: { select: { nome: true, cpf: true } },
                profissional: { select: { nome: true, especialidade: true } },
            },
        });

        logger.info('Consulta agendada', { id: consulta.id });
        return consulta;
    }

    /**
     * Lista consultas com paginação e filtros opcionais
     * Permite filtrar por paciente, profissional, status e tipo
     */
    async listar({ pagina = 1, limite = 10, pacienteId, profissionalId, status, tipo }) {
        // Monta os filtros dinâmicos conforme os parâmetros recebidos
        const where = {};
        if (pacienteId) where.pacienteId = pacienteId;
        if (profissionalId) where.profissionalId = profissionalId;
        if (status) where.status = status;
        if (tipo) where.tipo = tipo;

        const skip = (pagina - 1) * limite;

        // Executa consulta e contagem em paralelo
        const [consultas, total] = await Promise.all([
            prisma.consulta.findMany({
                where, skip, take: limite,
                orderBy: { dataHora: 'desc' },
                include: {
                    paciente: { select: { nome: true, cpf: true } },
                    profissional: { select: { nome: true, especialidade: true } },
                },
            }),
            prisma.consulta.count({ where }),
        ]);

        return {
            dados: consultas,
            paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
        };
    }

    /**
     * Busca uma consulta por ID com todos os dados relacionados
     * Inclui: paciente, profissional, prontuário, exames e prescrições
     */
    async buscarPorId(id) {
        const consulta = await prisma.consulta.findUnique({
            where: { id },
            include: {
                paciente: { select: { nome: true, cpf: true, telefone: true } },
                profissional: { select: { nome: true, especialidade: true, registroConselho: true } },
                prontuario: true,
                exames: true,
                prescricoes: true,
            },
        });
        if (!consulta) { const e = new Error('Consulta não encontrada.'); e.statusCode = 404; throw e; }
        return consulta;
    }

    /**
     * Cancela uma consulta previamente agendada
     * Não permite cancelar consultas já realizadas ou já canceladas
     */
    async cancelar(id) {
        const consulta = await this.buscarPorId(id);

        // Verifica se a consulta pode ser cancelada
        if (consulta.status === 'CANCELADA') {
            const e = new Error('Esta consulta já foi cancelada.'); e.statusCode = 400; throw e;
        }
        if (consulta.status === 'REALIZADA') {
            const e = new Error('Não é possível cancelar uma consulta já realizada.'); e.statusCode = 400; throw e;
        }

        // Atualiza o status para CANCELADA
        const atualizada = await prisma.consulta.update({
            where: { id },
            data: { status: 'CANCELADA' },
        });
        logger.info('Consulta cancelada', { id });
        return atualizada;
    }

    /**
     * Marca uma consulta agendada como realizada
     * Apenas consultas com status AGENDADA podem ser realizadas
     */
    async realizar(id) {
        const consulta = await this.buscarPorId(id);

        // Verifica se a consulta está com status adequado
        if (consulta.status !== 'AGENDADA') {
            const e = new Error('Apenas consultas agendadas podem ser realizadas.'); e.statusCode = 400; throw e;
        }

        // Atualiza o status para REALIZADA
        const atualizada = await prisma.consulta.update({
            where: { id },
            data: { status: 'REALIZADA' },
        });
        logger.info('Consulta realizada', { id });
        return atualizada;
    }
}

module.exports = new ConsultaService();
