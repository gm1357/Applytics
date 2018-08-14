const { check } = require('express-validator/check');

exports.login = [
    check('email').not().isEmpty().withMessage('Digite seu e-mail')
        .isEmail().withMessage('Forneça um e-mail válido'),
    check('senha').not().isEmpty().withMessage('Digite sua senha')
];

exports.cadastro = [
    check('nome').not().isEmpty().withMessage('Nome deve ser preenchido'),
    check('email').not().isEmpty().withMessage('E-mail deve ser preenchido')
        .isEmail().withMessage('E-mail deve ser válido'),
    check('nivel').not().isEmpty().withMessage('O nível de conhecimento deve ser informado')
        .isIn(['', 'Iniciante', 'Avançado']).withMessage('Deve ser escolhido um dos níveis fornecidos'),
    check('senha').not().isEmpty().withMessage('Senha deve ser preenchida')
        .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    check('senha-confirm').custom((value,{req}) => {
        if (!value || !req.body.senha || value !== req.body.senha) {
            throw new Error("Confirmação não confere com a senha");
        } else {
            return value;
        }
    })
];

exports.alterar = [
    check('nome').not().isEmpty().withMessage('Digite um nome'),
    check('nivel').not().isEmpty().withMessage('O nível de conhecimento deve ser informado')
        .isIn(['', 'Iniciante', 'Avançado']).withMessage('Deve ser escolhido um dos níveis fornecidos'),
    check('app').not().isEmpty().withMessage('Selecione um app')
];