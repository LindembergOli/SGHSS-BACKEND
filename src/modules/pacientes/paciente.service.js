const prisma = require('../../shared/prisma');
const logger = require('../../shared/utils/logger');

class PacienteService {
    /**
     * Cria um novo paciente vinculado ao usuário autenticado
     */
    async criar({ usuarioId, nome, cpf, dataNasc, telefone, endereco, sexo }) {
        // Verifica se já existe paciente com esse CPF
        const cpfExistente = await prisma.paciente.findUnique({ where: { cpf } });
        if (cpfExistente) {
            const error = new Error('CPF já cadastrado.');
            error.statusCode = 409;
            throw error;
        }

        // Verifica se o usuário já tem um paciente vinculado
        const pacienteExistente = await prisma.paciente.findUnique({ where: { usuarioId } });
        if (pacienteExistente) {
            const error = new Error('Este usuário já possui um cadastro de paciente.');
            error.statusCode = 409;
            throw error;
        }

        const paciente = await prisma.paciente.create({
            data: {
                usuarioId,
                nome,
                cpf,
                dataNasc: new Date(dataNasc),
                telefone,
                endereco,
                sexo: sexo || null,
            },
        });

        logger.info('Paciente criado', { id: paciente.id, cpf: paciente.cpf });
        return paciente;
    }

    /**
     * Lista todos os pacientes com paginação
     */
    async listar({ pagina = 1, limite = 10 }) {
        const skip = (pagina - 1) * limite;

        const [pacientes, total] = await Promise.all([
            prisma.paciente.findMany({
                skip,
                take: limite,
                orderBy: { createdAt: 'desc' },
                include: {
                    usuario: {
                        select: { email: true, perfil: true, ativo: true },
                    },
                },
            }),
            prisma.paciente.count(),
        ]);

        return {
            dados: pacientes,
            paginacao: {
                total,
                pagina,
                limite,
                totalPaginas: Math.ceil(total / limite),
            },
        };
    }

    /**
     * Busca um paciente por ID
     */
    async buscarPorId(id) {
        const paciente = await prisma.paciente.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: { email: true, perfil: true, ativo: true },
                },
                consultas: {
                    orderBy: { dataHora: 'desc' },
                    take: 5,
                },
                prontuarios: {
                    orderBy: { data: 'desc' },
                    take: 5,
                },
            },
        });

        if (!paciente) {
            const error = new Error('Paciente não encontrado.');
            error.statusCode = 404;
            throw error;
        }

        return paciente;
    }

    /**
     * Atualiza um paciente
     */
    async atualizar(id, dados) {
        // Verifica se o paciente existe
        await this.buscarPorId(id);

        // Se veio CPF, verifica se já existe em outro paciente
        if (dados.cpf) {
            const cpfExistente = await prisma.paciente.findFirst({
                where: { cpf: dados.cpf, NOT: { id } },
            });
            if (cpfExistente) {
                const error = new Error('CPF já cadastrado para outro paciente.');
                error.statusCode = 409;
                throw error;
            }
        }

        if (dados.dataNasc) {
            dados.dataNasc = new Date(dados.dataNasc);
        }

        const paciente = await prisma.paciente.update({
            where: { id },
            data: dados,
        });

        logger.info('Paciente atualizado', { id: paciente.id });
        return paciente;
    }

    /**
     * Remove um paciente
     */
    async remover(id) {
        await this.buscarPorId(id);

        await prisma.paciente.delete({ where: { id } });

        logger.info('Paciente removido', { id });
        return { mensagem: 'Paciente removido com sucesso.' };
    }
}

module.exports = new PacienteService();
