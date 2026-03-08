/**
 * Controller do módulo de Pacientes
 * 
 * Recebe as requisições HTTP, valida os dados de entrada,
 * chama o service correspondente e retorna a resposta ao cliente.
 */

const { validationResult } = require('express-validator');
const pacienteService = require('./paciente.service');

class PacienteController {
    /**
     * POST /pacientes
     * Cadastra um novo paciente vinculado ao usuário autenticado
     */
    async criar(req, res, next) {
        try {
            // Verifica se há erros de validação nos dados recebidos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });
            }

            // Extrai os dados do corpo da requisição
            const { nome, cpf, dataNasc, telefone, endereco, sexo } = req.body;

            // Cria o paciente vinculado ao usuário logado
            const paciente = await pacienteService.criar({
                usuarioId: req.usuario.id,
                nome, cpf, dataNasc, telefone, endereco, sexo,
            });

            return res.status(201).json(paciente);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /pacientes
     * Lista todos os pacientes com paginação
     */
    async listar(req, res, next) {
        try {
            // Obtém parâmetros de paginação da query string
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;

            const resultado = await pacienteService.listar({ pagina, limite });
            return res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /pacientes/:id
     * Busca um paciente específico por ID com dados relacionados
     */
    async buscarPorId(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });
            }

            const paciente = await pacienteService.buscarPorId(req.params.id);
            return res.status(200).json(paciente);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /pacientes/:id
     * Atualiza os dados de um paciente existente
     */
    async atualizar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });
            }

            // Monta o objeto apenas com os campos que foram enviados
            const { nome, cpf, dataNasc, telefone, endereco, sexo } = req.body;
            const dados = {};
            if (nome) dados.nome = nome;
            if (cpf) dados.cpf = cpf;
            if (dataNasc) dados.dataNasc = dataNasc;
            if (telefone) dados.telefone = telefone;
            if (endereco) dados.endereco = endereco;
            if (sexo) dados.sexo = sexo;

            const paciente = await pacienteService.atualizar(req.params.id, dados);
            return res.status(200).json(paciente);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /pacientes/:id
     * Remove um paciente do sistema
     */
    async remover(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });
            }

            const resultado = await pacienteService.remover(req.params.id);
            return res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new PacienteController();
