CREATE DATABASE TeleRemedio;
USE teleremedio;

CREATE TABLE IF NOT EXISTS `teleremedio`.`administradores` (
  `idadministradores` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(60) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  `CPF` VARCHAR(11) NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `email` VARCHAR(128) NOT NULL,
  `ultimo_alterado_por` INT NULL DEFAULT NULL,
  `criado_por` INT NULL,
  PRIMARY KEY (`idadministradores`),
  UNIQUE INDEX `idadministradores_UNIQUE` (`idadministradores` ASC) VISIBLE,
  UNIQUE INDEX `nome_UNIQUE` (`nome` ASC) VISIBLE,
  UNIQUE INDEX `CPF_UNIQUE` (`CPF` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;
  
CREATE TABLE IF NOT EXISTS `teleremedio`.`usuarios` (
  `user_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Id do usuario para identificação no banco dados.',
  `nome` VARCHAR(128) NOT NULL COMMENT 'Nome do usuario',
  `senha` VARCHAR(64) NOT NULL,
  `cpf` VARCHAR(11) NOT NULL,
  `idade` INT NOT NULL COMMENT 'Idade do usuario',
  `telefone` VARCHAR(14) NOT NULL COMMENT 'Telefone para contato',
  `data_nascimento` DATE NOT NULL COMMENT 'Data de nascimento do usuario',
  `email` VARCHAR(255) NOT NULL COMMENT 'e-mail para contato',
  `endereco` JSON NOT NULL COMMENT 'Endereço de entrega dos itens em um JSON\n{\nLogradouro\nNúmero\nBairro\nCidade\n}',
  `status` INT NOT NULL,
  `ultimo_alterado_por` INT NULL,
  `criado_por` INT NOT NULL,
  PRIMARY KEY (`user_id`, `criado_por`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `telefone_UNIQUE` (`telefone` ASC) VISIBLE,
  UNIQUE INDEX `nome_UNIQUE` (`nome` ASC) VISIBLE,
  INDEX `fk_usuarios_administradores1_idx` (`criado_por` ASC) VISIBLE,
  UNIQUE INDEX `cpf_UNIQUE` (`cpf` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_administradores1`
    FOREIGN KEY (`criado_por`)
    REFERENCES `teleremedio`.`administradores` (`idadministradores`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
INSERT_METHOD = LAST;

CREATE TABLE IF NOT EXISTS `teleremedio`.`estoque` (
  `item_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Id do produto',
  `nome_produto` VARCHAR(60) NOT NULL COMMENT 'Nome do produto',
  `quantidade` INT NOT NULL COMMENT 'Quantidade em estoque do produto',
  `listar` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Se for 1 será listado, se 0, não será;',
  `ultimo_alterado_por` INT NULL,
  `criado_por` INT NOT NULL,
  PRIMARY KEY (`item_id`, `criado_por`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE,
  INDEX `fk_estoque_administradores1_idx` (`criado_por` ASC) VISIBLE,
  CONSTRAINT `fk_estoque_administradores1`
    FOREIGN KEY (`criado_por`)
    REFERENCES `teleremedio`.`administradores` (`idadministradores`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `teleremedio`.`pedidos` (
  `pedidos_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Código unico de identificação do pedido, basedo em 6 digitos 123456',
  `items` JSON NOT NULL COMMENT 'Itens do pedido em um JSON',
  `status` VARCHAR(45) NOT NULL DEFAULT 'Em andamento' COMMENT 'Estado do pedido, se está em andamento, concluído, sem sucesso, etc.',
  `data_pedido` TIMESTAMP NOT NULL,
  `data_prevista` DATETIME NOT NULL,
  `usuarios_user_id` INT NOT NULL,
  PRIMARY KEY (`pedidos_id`, `usuarios_user_id`),
  UNIQUE INDEX `pedidos_id_UNIQUE` (`pedidos_id` ASC) VISIBLE,
  INDEX `fk_pedidos_usuarios1_idx` (`usuarios_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_pedidos_usuarios1`
    FOREIGN KEY (`usuarios_user_id`)
    REFERENCES `teleremedio`.`usuarios` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `teleremedio`.`historico_pedidos` (
  `historico_id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID único do registro no histórico',
  `pedido_id` INT NOT NULL COMMENT 'Chave estrangeira para o pedido',
  `usuario_id` INT NOT NULL COMMENT 'Referência ao usuário dono do pedido',
  `status` VARCHAR(45) NOT NULL COMMENT 'Novo status do pedido',
  `data_alteracao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da alteração',
  `observacao` TEXT NULL COMMENT 'Observações sobre a mudança de status',
  `alterado_por` INT NOT NULL COMMENT 'ID do administrador que alterou o pedido',
  PRIMARY KEY (`historico_id`),
  INDEX `fk_historico_pedidos_pedidos_idx` (`pedido_id`, `usuario_id`),
  INDEX `fk_historico_pedidos_admin_idx` (`alterado_por`),
  CONSTRAINT `fk_historico_pedidos_pedidos`
    FOREIGN KEY (`pedido_id`, `usuario_id`)
    REFERENCES `teleremedio`.`pedidos` (`pedidos_id`, `usuarios_user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_historico_pedidos_admin`
    FOREIGN KEY (`alterado_por`)
    REFERENCES `teleremedio`.`administradores` (`idadministradores`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB;

UPDATE estoque SET quantidade = quantidade-1 WHERE item_id = 1;

INSERT INTO administradores(nome, senha, CPF, email) VALUES('ADM DEFAULT', '19222', '00000000000', 'admdefault@empress.com');

SELECT * FROM administradores;
SELECT * FROM usuarios;
SELECT * FROM estoque;
SELECT * FROM pedidos;
SELECT (u.user_id) AS cod, u.nome, u.cpf, u.idade, u.telefone, u.data_nascimento, u.email, u.endereco, u.status, (u.administradores_idadministradores) as criado_por FROM usuarios u;
SELECT (ad.idadministradores) AS cod, ad.nome, ad.cpf, ad.email, ad.status, ad.criado_por FROM administradores ad;

DROP DATABASE teleremedio


