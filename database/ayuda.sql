USE oasisdb;

CREATE TABLE IF NOT EXISTS `vehiculos_tienda` (
  `id_vehiculo` INT NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `precio_actual` INT NOT NULL,
  `stock_global` INT NOT NULL DEFAULT 0,
  `imagen_url` VARCHAR(255) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `casino_accesos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `pagado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_casino_acceso_discord` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `casino_jugadas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `slot_number` TINYINT NOT NULL DEFAULT 1,
  `juego` VARCHAR(30) NOT NULL,
  `apuesta` INT NOT NULL,
  `ganancia` INT NOT NULL DEFAULT 0,
  `resultado` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_casino_jugadas_usuario` (`discord_id`, `slot_number`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `crypto_billeteras` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `slot_number` TINYINT NOT NULL DEFAULT 1,
  `moneda` VARCHAR(10) NOT NULL,
  `cantidad` BIGINT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_crypto_wallet` (`discord_id`, `slot_number`, `moneda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `crypto_movimientos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `slot_number` TINYINT NOT NULL DEFAULT 1,
  `moneda` VARCHAR(10) NOT NULL,
  `tipo` ENUM('compra','venta') NOT NULL,
  `cantidad` BIGINT NOT NULL,
  `precio_unitario` INT NOT NULL,
  `monto_total` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_crypto_movimientos_usuario` (`discord_id`, `slot_number`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `recompensas_diarias`
  ADD INDEX IF NOT EXISTS `idx_recompensas_discord_slot_created` (`discord_id`, `slot_number`, `created_at`);
