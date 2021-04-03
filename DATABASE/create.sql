-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema app
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `app` ;

-- -----------------------------------------------------
-- Schema app
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `app` DEFAULT CHARACTER SET utf8 ;
USE `app` ;

-- -----------------------------------------------------
-- Table `app`.`utente`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`utente` (
  `Cod_Utente` INT(11) NOT NULL,
  `Codice_Fiscale` CHAR(16) NOT NULL,
  `Nome` VARCHAR(45) NOT NULL,
  `Cognome` VARCHAR(45) NOT NULL,
  `Sesso` CHAR(1) NOT NULL,
  `Data_Nascita` DATE NOT NULL,
  `Citta_Nascita` VARCHAR(45) NOT NULL,
  `Residenza` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Password` VARCHAR(45) NOT NULL,
  `Cellulare` CHAR(10) NOT NULL,
  `TelegramChatId` VARCHAR(45) NULL,
  PRIMARY KEY (`Cod_Utente`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC),
  UNIQUE INDEX `Codice_Fiscale_UNIQUE` (`Codice_Fiscale` ASC),
  UNIQUE INDEX `Cellulare_UNIQUE` (`Cellulare` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`metodo_pagamento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`metodo_pagamento` (
  `Ref_Utente` INT(11) NOT NULL,
  `Cod_Metodo` INT(11) NOT NULL,
  `Di_Default` TINYINT(1) NULL DEFAULT NULL,
  `Tipo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`Ref_Utente`, `Cod_Metodo`),
  INDEX `RefUtente_idx` (`Ref_Utente` ASC),
  CONSTRAINT `RefUtente`
    FOREIGN KEY (`Ref_Utente`)
    REFERENCES `app`.`utente` (`Cod_Utente`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`carta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`carta` (
  `Ref_Utente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `Codice` BIGINT(20) NOT NULL,
  `Scadenza` DATE NOT NULL,
  `CVV` INT(11) NOT NULL,
  `Saldo` FLOAT NOT NULL,
  `IBAN` CHAR(27) NULL DEFAULT NULL,
  PRIMARY KEY (`Ref_Utente`, `Ref_Metodo`),
  CONSTRAINT `RefMetodo2`
    FOREIGN KEY (`Ref_Utente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`conto_bancario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`conto_bancario` (
  `Ref_Utente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `IBAN` CHAR(27) NOT NULL,
  `Saldo` FLOAT NOT NULL,
  PRIMARY KEY (`Ref_Utente`, `Ref_Metodo`),
  CONSTRAINT `RefMetodo4`
    FOREIGN KEY (`Ref_Utente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`conto_online`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`conto_online` (
  `Ref_Utente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `Saldo` FLOAT NOT NULL DEFAULT '0',
  PRIMARY KEY (`Ref_Utente`, `Ref_Metodo`),
  CONSTRAINT `RefMetodo3`
    FOREIGN KEY (`Ref_Utente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`limite_spesa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`limite_spesa` (
  `Ref_Utente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `Limite` FLOAT NULL DEFAULT NULL,
  `Tipo` CHAR(1) NOT NULL,
  PRIMARY KEY (`Ref_Utente`, `Ref_Metodo`, `Tipo`),
  CONSTRAINT `RefMetodo5`
    FOREIGN KEY (`Ref_Utente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`pagamento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`pagamento` (
  `Ref_Mittente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `Nome_Esercizio` VARCHAR(45) NOT NULL,
  `Importo` FLOAT NOT NULL,
  `Data` DATE NOT NULL,
  `Ora` TIME NOT NULL,
  PRIMARY KEY (`Ref_Mittente`, `Data`, `Ora`, `Ref_Metodo`),
  INDEX `RefMetodo1_idx` (`Ref_Mittente` ASC, `Ref_Metodo` ASC),
  CONSTRAINT `RefMetodo1`
    FOREIGN KEY (`Ref_Mittente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`periodicita`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`periodicita` (
  `Ref_Mittente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `Data_Avvio` DATE NOT NULL,
  `Ora_Avvio` TIME NOT NULL,
  `Nome_Esercizio` VARCHAR(45) NOT NULL,
  `Importo` FLOAT NOT NULL,
  `Numero_giorni` INT(11) NULL DEFAULT NULL,
  `Giorni_rimanenti` INT(11) NULL DEFAULT NULL,
  `Numero_Pagamenti` INT(11) NULL DEFAULT NULL,
  `Importo_Totale` FLOAT NULL DEFAULT NULL,
  PRIMARY KEY (`Ref_Mittente`, `Ref_Metodo`, `Data_Avvio`, `Ora_Avvio`),
  INDEX `RefPeriodicita_idx` (`Ref_Mittente` ASC, `Ref_Metodo` ASC),
  CONSTRAINT `RefPeriodicita`
    FOREIGN KEY (`Ref_Mittente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`richiesta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`richiesta` (
  `Cod_Richiesta` INT(11) NOT NULL,
  `Ref_Mittente` INT(11) NOT NULL,
  `Ref_Metodo` INT(11) NOT NULL,
  `Email_Destinatario` VARCHAR(45) NULL DEFAULT NULL,
  `Cellulare_Destinatario` CHAR(10) NULL DEFAULT NULL,
  `Importo` FLOAT NOT NULL,
  `Tipo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`Cod_Richiesta`),
  INDEX `RefRichiesta_idx` (`Ref_Mittente` ASC, `Ref_Metodo` ASC),
  CONSTRAINT `RefRichiesta`
    FOREIGN KEY (`Ref_Mittente` , `Ref_Metodo`)
    REFERENCES `app`.`metodo_pagamento` (`Ref_Utente` , `Cod_Metodo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `app`.`transazione`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `app`.`transazione` (
  `Ref_Richiesta` INT(11) NOT NULL,
  `Data` DATE NOT NULL,
  `Ora` TIME NOT NULL,
  PRIMARY KEY (`Ref_Richiesta`),
  INDEX `RefTransazione_idx` (`Ref_Richiesta` ASC),
  CONSTRAINT `RefTransazione`
    FOREIGN KEY (`Ref_Richiesta`)
    REFERENCES `app`.`richiesta` (`Cod_Richiesta`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
