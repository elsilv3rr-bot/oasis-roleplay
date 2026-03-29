-- Estructura auto ejecutable --
-- Ejecutar en MariaDB como usuario .process.env.DB_USER y todos los .env necesarios -- OBLIGATORIO!!
-- Conexion: mariadb -h 127.0.0.1 -P puerto -u usuario(privado) -p (solo para desarrolladores)

USE oasisdb;

-- TABLA USERS (autenticacion via Discord OAuth2) --
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_discord_id` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA USUARIOS (personajes del portal) --
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slot_number` TINYINT NOT NULL DEFAULT 1,
  `stateid` VARCHAR(10) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `edad` INT NOT NULL,
  `nacionalidad` VARCHAR(80) NOT NULL,
  `rol` VARCHAR(30) NOT NULL DEFAULT 'civil',
  `dinero` INT NOT NULL DEFAULT 20000,
  `discord_id` VARCHAR(30) NOT NULL,
  `discord_username` VARCHAR(100) DEFAULT NULL,
  `discord_avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_discord_slot` (`discord_id`, `slot_number`),
  UNIQUE KEY `uq_usuarios_stateid` (`stateid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA DE SLOTS POR USUARIO --
CREATE TABLE IF NOT EXISTS `user_character_slots` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `slot_number` TINYINT NOT NULL,
  `is_unlocked` TINYINT(1) NOT NULL DEFAULT 0,
  `unlocked_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slot_usuario` (`discord_id`, `slot_number`),
  KEY `idx_slot_discord` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MIGRACION SEGURA PARA BASES EXISTENTES --
-- Esto es para migrar, no toque si no sabe --
ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `slot_number` TINYINT NOT NULL DEFAULT 1 AFTER `id`;

ALTER TABLE `usuarios`
  DROP INDEX IF EXISTS `uq_usuarios_discord_id`;

CREATE UNIQUE INDEX IF NOT EXISTS `uq_usuarios_discord_slot`
ON `usuarios` (`discord_id`, `slot_number`);

-- Inserta slots base para usuarios existentes: slot 1 desbloqueado, resto bloqueados --
-- Lo mismo, no lo toque si no sabe --
INSERT IGNORE INTO `user_character_slots` (`discord_id`, `slot_number`, `is_unlocked`)
SELECT `discord_id`, 1, 1 FROM `users`;

INSERT IGNORE INTO `user_character_slots` (`discord_id`, `slot_number`, `is_unlocked`)
SELECT `discord_id`, 2, 0 FROM `users`;

INSERT IGNORE INTO `user_character_slots` (`discord_id`, `slot_number`, `is_unlocked`)
SELECT `discord_id`, 3, 0 FROM `users`;

INSERT IGNORE INTO `user_character_slots` (`discord_id`, `slot_number`, `is_unlocked`)
SELECT `discord_id`, 4, 0 FROM `users`;

-- Para entender de la exportacion comunicarse con https://duohnson.com/ --