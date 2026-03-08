/**
 * Validadores do módulo de Profissionais de Saúde
 * 
 * Define regras de validação para criação e atualização
 * de profissionais (médicos, enfermeiros, técnicos).
 */

const { body, param } = require('express-validator');

// Validação para cadastro de novo profissional
const criarProfissionalValidator = [
    body('usuarioId')
        .isUUID().withMessage('ID de usuário inválido.')
        .notEmpty().withMessage('O ID do usuário é obrigatório.'),
    body('nome')
        .notEmpty().withMessage('O nome é obrigatório.')
        .isLength({ min: 3 }).withMessage('O nome deve ter no mínimo 3 caracteres.'),
    body('registroConselho')
        .notEmpty().withMessage('O registro do conselho é obrigatório.'),
    body('especialidade')
        .notEmpty().withMessage('A especialidade é obrigatória.'),
    body('tipo')
        .isIn(['MEDICO', 'ENFERMEIRO', 'TECNICO'])
        .withMessage('Tipo deve ser MEDICO, ENFERMEIRO ou TECNICO.'),
    body('unidadeId')
        .optional().isUUID().withMessage('ID da unidade inválido.'),
];

// Validação para atualização parcial de profissional
const atualizarProfissionalValidator = [
    param('id').isUUID().withMessage('ID inválido.'),
    body('nome').optional().isLength({ min: 3 }).withMessage('O nome deve ter no mínimo 3 caracteres.'),
    body('registroConselho').optional(),
    body('especialidade').optional(),
    body('tipo').optional().isIn(['MEDICO', 'ENFERMEIRO', 'TECNICO']).withMessage('Tipo deve ser MEDICO, ENFERMEIRO ou TECNICO.'),
    body('unidadeId').optional().isUUID().withMessage('ID da unidade inválido.'),
];

// Validação do parâmetro de ID na URL
const idValidator = [
    param('id').isUUID().withMessage('ID inválido.'),
];

module.exports = { criarProfissionalValidator, atualizarProfissionalValidator, idValidator };
