const { check } = require('express-validator/check');

exports.cadastro = [
    check('nome').not().isEmpty().withMessage('Digite o nome do seu app'),
    check('pais').not().isEmpty().withMessage('Selecione o país base do seu app'),
    check('categoria').not().isEmpty().withMessage('Selecione uma categoria para seu app'),
    check('views').not().isEmpty().withMessage('Adicione pelo menos uma tela')
];

exports.alterar = [
    check('nome').not().isEmpty().withMessage('Digite o nome do seu app'),
    check('pais').not().isEmpty().withMessage('Selecione o país base do seu app'),
    check('categoria').not().isEmpty().withMessage('Selecione uma categoria para seu app'),
    check('views').not().isEmpty().withMessage('Adicione pelo menos uma tela')
];