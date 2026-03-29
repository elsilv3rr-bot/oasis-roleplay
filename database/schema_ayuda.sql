-- SCHEMA AYUDA - Nuevas tablas y columnas para Oasis RolePlay --
-- Solo comandos ADD COLUMN y CREATE TABLE --
-- Copiar y pegar directamente en MariaDB --

USE oasisdb;

-- ============================================================
-- 1. ADMINISTRADORES (vinculados por discord_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `agregado_por` VARCHAR(30) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_discord` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. PROFESIONES DINAMICAS (creadas desde el panel admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS `profesiones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT '',
  `salario_diario` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_profesion_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profesiones base --
INSERT IGNORE INTO `profesiones` (`nombre`, `descripcion`, `salario_diario`) VALUES
  ('civil', 'Ciudadano comun', 500),
  ('policia', 'Oficial de policia', 1500),
  ('medico', 'Medico del hospital', 1200),
  ('mecanico', 'Mecanico de vehiculos', 800);

-- ============================================================
-- 3. MULTAS (persistidas en DB, no localStorage)
-- ============================================================
CREATE TABLE IF NOT EXISTS `multas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `stateid_infractor` VARCHAR(10) NOT NULL,
  `stateid_oficial` VARCHAR(10) DEFAULT NULL,
  `motivo` VARCHAR(255) NOT NULL,
  `monto` INT NOT NULL DEFAULT 0,
  `pagada` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_multas_infractor` (`stateid_infractor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CARGOS JUDICIALES
-- ============================================================
CREATE TABLE IF NOT EXISTS `cargos_judiciales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `stateid_acusado` VARCHAR(10) NOT NULL,
  `stateid_oficial` VARCHAR(10) DEFAULT NULL,
  `cargo` VARCHAR(255) NOT NULL,
  `gravedad` ENUM('leve','moderado','grave') NOT NULL DEFAULT 'leve',
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cargos_acusado` (`stateid_acusado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. VEHICULOS REGISTRADOS (matriculas legales)
-- ============================================================
CREATE TABLE IF NOT EXISTS `vehiculos_registrados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `stateid_propietario` VARCHAR(10) NOT NULL,
  `nombre_vehiculo` VARCHAR(100) NOT NULL,
  `matricula` VARCHAR(20) NOT NULL,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_matricula` (`matricula`),
  KEY `idx_vehiculo_propietario` (`stateid_propietario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. NIVELES VIP
-- ============================================================
CREATE TABLE IF NOT EXISTS `niveles_vip` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  `recompensa_diaria` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vip_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Niveles VIP base --
INSERT IGNORE INTO `niveles_vip` (`nombre`, `recompensa_diaria`) VALUES
  ('ninguno', 500),
  ('bronce', 1000),
  ('plata', 2000),
  ('oro', 3500),
  ('diamante', 5000);

-- ============================================================
-- 7. RECOMPENSAS DIARIAS (registro de cobros)
-- ============================================================
CREATE TABLE IF NOT EXISTS `recompensas_diarias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `slot_number` TINYINT NOT NULL DEFAULT 1,
  `monto` INT NOT NULL,
  `fecha_cobro` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_recompensa_dia` (`discord_id`, `slot_number`, `fecha_cobro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. COLUMNAS NUEVAS EN TABLA usuarios
-- ============================================================

-- Nivel VIP del personaje --
ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `nivel_vip` VARCHAR(30) NOT NULL DEFAULT 'ninguno' AFTER `rol`;

-- Placa policial (solo para policia) --
ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `placa_policial` VARCHAR(20) DEFAULT NULL AFTER `nivel_vip`;

-- ============================================================
-- 9. INVENTARIO PERSISTENTE (objetos en mochila)
-- ============================================================
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `discord_id` VARCHAR(30) NOT NULL,
  `slot_number` TINYINT NOT NULL DEFAULT 1,
  `nombre_item` VARCHAR(100) NOT NULL,
  `tipo` ENUM('vehiculo','documento','arma','otro') NOT NULL DEFAULT 'otro',
  `datos_extra` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventario_owner` (`discord_id`, `slot_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. LOG DE ACCIONES ADMINISTRATIVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_discord_id` VARCHAR(30) NOT NULL,
  `accion` VARCHAR(255) NOT NULL,
  `objetivo_discord_id` VARCHAR(30) DEFAULT NULL,
  `detalles` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_logs_admin` (`admin_discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
