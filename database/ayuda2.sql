USE oasisdb;

-- ==============================
-- Oasis RolePlay - Migracion Admin/Mercado (30-03-2026)
-- ==============================

-- Catalogo de items del mercado (armas y documentos/licencias)
CREATE TABLE IF NOT EXISTS `mercado_items` (
  `id_item` INT NOT NULL,
  `tipo` ENUM('arma','documento') NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `precio_actual` INT NOT NULL,
  `stock_global` INT NOT NULL DEFAULT 0,
  `imagen_url` VARCHAR(255) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`),
  KEY `idx_mercado_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed base de documentos/licencias
INSERT INTO `mercado_items` (`id_item`, `tipo`, `nombre`, `precio_actual`, `stock_global`, `imagen_url`) VALUES
  (1, 'documento', 'Licencia de Conducir', 1500, 9999, '/licencias/licencia.png'),
  (2, 'documento', 'Licencia de Motos', 1000, 9999, '/licencias/licencia.png'),
  (3, 'documento', 'Licencia de Camiones', 2000, 9999, '/licencias/licencia.png'),
  (4, 'documento', 'Licencia de Buses', 1500, 9999, '/licencias/licencia.png'),
  (5, 'documento', 'Licencia de Tractor', 1500, 9999, '/licencias/licencia.png'),
  (6, 'documento', 'Licencia de Armas', 2500, 9999, '/licencias/licencia.png')
ON DUPLICATE KEY UPDATE
  `tipo` = VALUES(`tipo`),
  `nombre` = VALUES(`nombre`),
  `precio_actual` = VALUES(`precio_actual`),
  `imagen_url` = VALUES(`imagen_url`);

-- Seed base de armas
INSERT INTO `mercado_items` (`id_item`, `tipo`, `nombre`, `precio_actual`, `stock_global`, `imagen_url`) VALUES
  (101, 'arma', 'Glock 17', 15000, 9999, '/armas/glock.png')
ON DUPLICATE KEY UPDATE
  `tipo` = VALUES(`tipo`),
  `nombre` = VALUES(`nombre`),
  `precio_actual` = VALUES(`precio_actual`),
  `imagen_url` = VALUES(`imagen_url`);
