CREATE DATABASE TeleRemedio;
USE teleremedio;

CREATE TABLE IF NOT EXISTS `teleremedio`.`usuarios` (
  `user_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Id do usuario para identificação no banco dados.',
  `nome` VARCHAR(128) NOT NULL COMMENT 'Nome do usuario',
  `senha` VARCHAR(64) NOT NULL COMMENT 'SENHA',
  `idade` INT NOT NULL COMMENT 'Idade do usuario',
  `data_nascimento` DATE NOT NULL COMMENT 'Data de nascimento do usuario',
  `telefone` VARCHAR(14) NOT NULL COMMENT 'Telefone para contato',
  `email` TEXT(2000) NOT NULL UNIQUE COMMENT 'e-mail para contato',
  `endereco` TEXT NOT NULL COMMENT 'Endereço de entrega dos itens em uma string JSON\n{\nLogradouro\nNúmero\nBairro\nCidade\n}',
  `tipo` VARCHAR(4) NOT NULL COMMENT '/*Códigos de tipos de usuario, Usuario padrão: 0303 | Usuario Administrador: 0001*/',
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE)
ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `teleremedio`.`estoque` (
  `item_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Id do produto',
  `nome_produto` VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nome do produto',
  `quantidade` INT NOT NULL COMMENT 'Quantidade em estoque do produto',
  `listar` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Se for 1 será listado, se 0, não será;',
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `teleremedio`.`pedidos` (
  `pedidos_id` INT NOT NULL COMMENT 'Código unico de identificação do pedido, basedo em 6 digitos 123456',
  `cliente_id` INT NOT NULL COMMENT 'Id do cliente',
  `itens` JSON NOT NULL COMMENT 'Id dos itens em um JSON',
  `descricao` TEXT NOT NULL COMMENT 'Descrição do pedido',
  PRIMARY KEY (`pedidos_id`),
  UNIQUE INDEX `pedidos_id_UNIQUE` (`pedidos_id` ASC) VISIBLE,
  INDEX `cliente_id_idx` (`cliente_id` ASC) VISIBLE,
  CONSTRAINT `cliente_id`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `teleremedio`.`usuarios` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB

SELECT * FROM usuarios;
