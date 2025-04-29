CREATE DATABASE TeleRemedio;
USE teleremedio;

CREATE TABLE IF NOT EXISTS `teleremedio`.`administradores` (
  `idadministradores` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(60) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  `CPF` VARCHAR(11) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `criado_por` INT NULL,
  PRIMARY KEY (`idadministradores`),
  UNIQUE INDEX `idadministradores_UNIQUE` (`idadministradores` ASC) VISIBLE,
  UNIQUE INDEX `nome_UNIQUE` (`nome` ASC) VISIBLE,
  UNIQUE INDEX `CPF_UNIQUE` (`CPF` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `fk_criado_por_id` (`criado_por` ASC) VISIBLE,
  CONSTRAINT `fk_criado_por` FOREIGN KEY (`criado_por`) references `teleremedio`.`administradores` (`idadministradores`)
  ON DELETE SET NULL
  ON UPDATE NO ACTION
  )
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
  `administradores_idadministradores` INT NOT NULL,
  PRIMARY KEY (`user_id`, `administradores_idadministradores`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `telefone_UNIQUE` (`telefone` ASC) VISIBLE,
  UNIQUE INDEX `nome_UNIQUE` (`nome` ASC) VISIBLE,
  INDEX `fk_usuarios_administradores1_idx` (`administradores_idadministradores` ASC) VISIBLE,
  UNIQUE INDEX `cpf_UNIQUE` (`cpf` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_administradores1`
    FOREIGN KEY (`administradores_idadministradores`)
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
  `administradores_idadministradores` INT NOT NULL,
  PRIMARY KEY (`item_id`, `administradores_idadministradores`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE,
  INDEX `fk_estoque_administradores1_idx` (`administradores_idadministradores` ASC) VISIBLE,
  CONSTRAINT `fk_estoque_administradores1`
    FOREIGN KEY (`administradores_idadministradores`)
    REFERENCES `teleremedio`.`administradores` (`idadministradores`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `teleremedio`.`pedidos` (
  `pedidos_id` INT NOT NULL COMMENT 'Código unico de identificação do pedido, basedo em 6 digitos 123456',
  `descricao` TEXT NOT NULL COMMENT 'Descrição do pedido',
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

CREATE TABLE IF NOT EXISTS `teleremedio`.`pedidos_estoque` (
  `pedidos_pedidos_id` INT NOT NULL,
  `pedidos_usuarios_user_id` INT NOT NULL,
  `estoque_item_id` INT NOT NULL,
  `estoque_administradores_idadministradores` INT NOT NULL,
  `quantidade` INT NOT NULL,
  PRIMARY KEY (`pedidos_pedidos_id`, `pedidos_usuarios_user_id`, `estoque_item_id`, `estoque_administradores_idadministradores`),
  INDEX `fk_pedidos_has_estoque_estoque1_idx` (`estoque_item_id` ASC, `estoque_administradores_idadministradores` ASC) VISIBLE,
  INDEX `fk_pedidos_has_estoque_pedidos1_idx` (`pedidos_pedidos_id` ASC, `pedidos_usuarios_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_pedidos_has_estoque_pedidos1`
    FOREIGN KEY (`pedidos_pedidos_id` , `pedidos_usuarios_user_id`)
    REFERENCES `teleremedio`.`pedidos` (`pedidos_id` , `usuarios_user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pedidos_has_estoque_estoque1`
    FOREIGN KEY (`estoque_item_id` , `estoque_administradores_idadministradores`)
    REFERENCES `teleremedio`.`estoque` (`item_id` , `administradores_idadministradores`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

INSERT INTO administradores(nome, senha, CPF, email) VALUES('ADM DEFAULT', '19222', '00000000000', 'admdefault@empress.com');

SELECT * FROM administradores;
SELECT * FROM usuarios;
DROP DATABASE teleremedio;
