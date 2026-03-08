/**
 * Controller do módulo de Prontuários
 * 
 * Recebe as requisições HTTP de prontuários médicos,
 * valida os dados e chama o service correspondente.
 */

const { validationResult } = require('express-validator');
const prontuarioService = require('./prontuario.service');

class ProntuarioController {
    /**
     * POST /prontuarios
     * Cria um novo prontuário vinculado a uma consulta realizada
     */
    async criar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { pacienteId, consultaId, descricao, diagnostico } = req.body;
            const prontuario = await prontuarioService.criar({ pacienteId, consultaId, descricao, diagnostico });
            return res.status(201).json(prontuario);
        } catch (err) { next(err); }
    }

    /**
     * GET /prontuarios/paciente/:pacienteId
     * Lista o histórico clínico (prontuários) de um paciente específico
     */
    async listarPorPaciente(req, res, next) {
        try {
            const resultado = await prontuarioService.listarPorPaciente(req.params.pacienteId, {
                pagina: parseInt(req.query.pagina) || 1, limite: parseInt(req.query.limite) || 10,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /**
     * GET /prontuarios/:id
     * Busca um prontuário específico com dados do paciente e profissional
     */
    async buscarPorId(req, res, next) {
        try {
            const prontuario = await prontuarioService.buscarPorId(req.params.id);
            return res.status(200).json(prontuario);
        } catch (err) { next(err); }
    }

    /**
     * PUT /prontuarios/:id
     * Atualiza a descrição ou diagnóstico de um prontuário existente
     */
    async atualizar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            // Monta o objeto apenas com os campos enviados
            const { descricao, diagnostico } = req.body || {};
            const dados = {};
            if (descricao) dados.descricao = descricao;
            if (diagnostico) dados.diagnostico = diagnostico;

            const prontuario = await prontuarioService.atualizar(req.params.id, dados);
            return res.status(200).json(prontuario);
        } catch (err) { next(err); }
    }
}

module.exports = new ProntuarioController();
