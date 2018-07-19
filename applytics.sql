CREATE DATABASE `applytics`;
USE `applytics`;

CREATE TABLE `usuarios` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nome` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `senha` varchar(255) NOT NULL,
    UNIQUE (email),
    PRIMARY KEY (id)
);

-------------------------- BANCO PARA TESTE------------------

CREATE DATABASE `applytics_test`;
USE `applytics_test`;

CREATE TABLE `usuarios` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nome` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `senha` varchar(255) NOT NULL,
    UNIQUE (email),
    PRIMARY KEY (id)
);