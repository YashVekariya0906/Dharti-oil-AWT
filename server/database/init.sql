-- ============================================================
-- Dharti Oil — Database Initialisation Script
-- Generated from Sequelize model definitions
-- Run automatically by server/scripts/initializeDatabase.js
-- on first startup (skipped if tables already exist).
-- ============================================================

-- ----------------------------------------------------------------
-- site_config
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_config` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `logo_text`       VARCHAR(255) NOT NULL,
  `logo_highlight`  VARCHAR(255) NOT NULL,
  `welcome_message` VARCHAR(255) NOT NULL,
  `discover_text`   TEXT         NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `site_config` (`logo_text`, `logo_highlight`, `welcome_message`, `discover_text`)
SELECT 'Dharti ', 'Oil', 'Welcome to Dharti Amrut',
       'Discover the purest and natural oils for your health and cooking needs.'
WHERE NOT EXISTS (SELECT 1 FROM `site_config` LIMIT 1);

-- ----------------------------------------------------------------
-- navbar
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `navbar` (
  `nav_id`       INT          NOT NULL AUTO_INCREMENT,
  `nav_logo_path` VARCHAR(255) DEFAULT NULL,
  `I1_path`      VARCHAR(255) DEFAULT NULL,
  `I2_path`      VARCHAR(255) DEFAULT NULL,
  `I3_path`      VARCHAR(255) DEFAULT NULL,
  `I4_path`      VARCHAR(255) DEFAULT NULL,
  `I5_path`      VARCHAR(255) DEFAULT NULL,
  `intro_path`   VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`nav_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `navbar` (`nav_logo_path`, `I1_path`, `I2_path`, `I3_path`, `I4_path`, `I5_path`, `intro_path`)
SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM `navbar` LIMIT 1);

-- ----------------------------------------------------------------
-- register  (User model)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `register` (
  `user_id`            INT          NOT NULL AUTO_INCREMENT,
  `username`           VARCHAR(255) NOT NULL,
  `moblie_no`          VARCHAR(20)  NOT NULL,
  `emali`              VARCHAR(255) NOT NULL,
  `address`            TEXT         NOT NULL,
  `pincode`            VARCHAR(10)  NOT NULL,
  `password`           VARCHAR(255) NOT NULL,
  `role`               VARCHAR(50)  NOT NULL DEFAULT 'user',
  `otp_code`           VARCHAR(10)  DEFAULT NULL,
  `otp_expiry`         DATETIME     DEFAULT NULL,
  `commission_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `status`             ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_register_emali` (`emali`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- products
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `product_id`          INT           NOT NULL AUTO_INCREMENT,
  `product_name`        VARCHAR(255)  NOT NULL,
  `product_quantity`    INT           DEFAULT 0,
  `product_description` TEXT          DEFAULT NULL,
  `product_price`       DECIMAL(10,2) NOT NULL,
  `product_discount`    DECIMAL(10,2) DEFAULT 0.00,
  `product_image`       VARCHAR(255)  DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- footer_settings
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `footer_settings` (
  `id`                  INT          NOT NULL AUTO_INCREMENT,
  `company_name`        VARCHAR(255) DEFAULT NULL,
  `address`             TEXT         DEFAULT NULL,
  `phone`               VARCHAR(20)  DEFAULT NULL,
  `email`               VARCHAR(255) DEFAULT NULL,
  `facebook_link`       VARCHAR(255) DEFAULT NULL,
  `instagram_link`      VARCHAR(255) DEFAULT NULL,
  `home_link`           VARCHAR(255) DEFAULT NULL,
  `shop_link`           VARCHAR(255) DEFAULT NULL,
  `about_link`          VARCHAR(255) DEFAULT NULL,
  `contact_link`        VARCHAR(255) DEFAULT NULL,
  `blog_link`           VARCHAR(255) DEFAULT NULL,
  `privacy_policy_link` VARCHAR(255) DEFAULT NULL,
  `return_exchange_link` VARCHAR(255) DEFAULT NULL,
  `working_days`        VARCHAR(255) DEFAULT NULL,
  `working_hours`       VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- shop_details
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `shop_details` (
  `id`                  INT  NOT NULL AUTO_INCREMENT,
  `main_title`          VARCHAR(255) DEFAULT NULL,
  `main_description`    TEXT         DEFAULT NULL,
  `product_highlights`  TEXT         DEFAULT NULL,
  `tin15_title`         VARCHAR(255) DEFAULT NULL,
  `tin15_description`   TEXT         DEFAULT NULL,
  `can15_title`         VARCHAR(255) DEFAULT NULL,
  `can15_description`   TEXT         DEFAULT NULL,
  `can5_title`          VARCHAR(255) DEFAULT NULL,
  `can5_description`    TEXT         DEFAULT NULL,
  `bottle1_title`       VARCHAR(255) DEFAULT NULL,
  `bottle1_description` TEXT         DEFAULT NULL,
  `quality_description` TEXT         DEFAULT NULL,
  `usage_description`   TEXT         DEFAULT NULL,
  `why_choose`          TEXT         DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- blog_details
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_details` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `title`        VARCHAR(255) NOT NULL,
  `slug`         VARCHAR(255) NOT NULL,
  `content`      LONGTEXT     NOT NULL,
  `banner_image` VARCHAR(255) DEFAULT NULL,
  `author`       VARCHAR(100) NOT NULL DEFAULT 'Dharti Oil Team',
  `status`       ENUM('draft','published') NOT NULL DEFAULT 'published',
  `created_at`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blog_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- contact_details
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_details` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `address`        TEXT         DEFAULT NULL,
  `email`          VARCHAR(255) DEFAULT NULL,
  `mobile`         VARCHAR(50)  DEFAULT NULL,
  `facebook_link`  VARCHAR(255) DEFAULT NULL,
  `instagram_link` VARCHAR(255) DEFAULT NULL,
  `youtube_link`   VARCHAR(255) DEFAULT NULL,
  `banner_image`   VARCHAR(255) DEFAULT NULL,
  `created_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- contact_inquiries
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name`  VARCHAR(255) NOT NULL,
  `phone`      VARCHAR(50)  NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `message`    TEXT         DEFAULT NULL,
  `user_id`    INT          NOT NULL,
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_contact_inquiries_user` (`user_id`),
  CONSTRAINT `fk_contact_inquiries_user`
    FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- brokers
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `brokers` (
  `broker_id`          INT          NOT NULL AUTO_INCREMENT,
  `name`               VARCHAR(255) NOT NULL,
  `mobile_no`          VARCHAR(20)  NOT NULL,
  `email`              VARCHAR(255) NOT NULL,
  `address`            TEXT         NOT NULL,
  `pincode`            VARCHAR(10)  NOT NULL,
  `password`           VARCHAR(255) NOT NULL,
  `commission_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `status`             ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  `role`               VARCHAR(50)  NOT NULL DEFAULT 'broker',
  `otp_code`           VARCHAR(10)  DEFAULT NULL,
  `otp_expiry`         DATETIME     DEFAULT NULL,
  `created_at`         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`broker_id`),
  UNIQUE KEY `uq_brokers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- global_prices
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `global_prices` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `current_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `global_prices` (`current_price`)
SELECT 0.00
WHERE NOT EXISTS (SELECT 1 FROM `global_prices` LIMIT 1);

-- ----------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id`       INT           NOT NULL AUTO_INCREMENT,
  `user_id`        INT           NOT NULL,
  `total_amount`   DECIMAL(10,2) NOT NULL,
  `status`         ENUM('Pending','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  `shipping_address` TEXT        DEFAULT NULL,
  `contact_number` VARCHAR(255)  DEFAULT NULL,
  `payment_method` VARCHAR(255)  DEFAULT NULL,
  `delivery_charge` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `cgst`           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sgst`           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `createdAt`      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_id`    INT           NOT NULL AUTO_INCREMENT,
  `order_id`         INT           NOT NULL,
  `product_id`       INT           NOT NULL,
  `quantity`         INT           NOT NULL DEFAULT 1,
  `price_at_purchase` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- delivery_charge
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_charge` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `charge_360001` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `charge_360002` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `charge_360003` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `charge_360004` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `upi_id`       VARCHAR(255)  DEFAULT '',
  `createdAt`    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `delivery_charge` (`charge_360001`, `charge_360002`, `charge_360003`, `charge_360004`, `upi_id`)
SELECT 0.00, 0.00, 0.00, 0.00, ''
WHERE NOT EXISTS (SELECT 1 FROM `delivery_charge` LIMIT 1);

-- ----------------------------------------------------------------
-- selling_requests
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `selling_requests` (
  `request_id`             INT           NOT NULL AUTO_INCREMENT,
  `user_id`                INT           NOT NULL,
  `stock_per_mound`        DECIMAL(10,2) NOT NULL,
  `our_price`              DECIMAL(10,2) NOT NULL,
  `customer_price`         DECIMAL(10,2) NOT NULL,
  `payment_method`         VARCHAR(20)   DEFAULT 'Cash',
  `broker_id`              INT           DEFAULT NULL,
  `status`                 ENUM(
                             'Pending','Accepted','Scheduled','Reached','Completed','Cancelled',
                             'AdminRejected','BrokerRejected','BrokerRejectionConfirmed'
                           ) NOT NULL DEFAULT 'Pending',
  `visit_day`              DATE          DEFAULT NULL,
  `visit_time`             TIME          DEFAULT NULL,
  `reached_at`             DATETIME      DEFAULT NULL,
  `is_visited`             TINYINT(1)    NOT NULL DEFAULT 0,
  `delivered_quantity`     DECIMAL(10,2) DEFAULT NULL,
  `payment_proof`          VARCHAR(255)  DEFAULT NULL,
  `broker_comments`        TEXT          DEFAULT NULL,
  `final_price`            DECIMAL(10,2) DEFAULT NULL,
  `sample_photos`          TEXT          DEFAULT NULL,
  `admin_reject_reason`    VARCHAR(255)  DEFAULT NULL,
  `admin_reject_comment`   TEXT          DEFAULT NULL,
  `broker_reject_reason`   VARCHAR(255)  DEFAULT NULL,
  `broker_reject_comment`  TEXT          DEFAULT NULL,
  `broker_reject_photos`   TEXT          DEFAULT NULL,
  `created_at`             DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `fk_selling_requests_user` (`user_id`),
  CONSTRAINT `fk_selling_requests_user`
    FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- broker_id FK is added at runtime by ensureSellingRequestBrokerFk() in index.js

-- ----------------------------------------------------------------
-- about_us
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `about_us` (
  `id`                 INT          NOT NULL AUTO_INCREMENT,
  `company_intro`      LONGTEXT     DEFAULT NULL,
  `about_banner_image` VARCHAR(500) DEFAULT NULL,
  `about_intro_image`  VARCHAR(500) DEFAULT NULL,
  `infra_title`        VARCHAR(255) DEFAULT 'Infrastructure',
  `infra_description`  LONGTEXT     DEFAULT NULL,
  `infra_image_1`      VARCHAR(500) DEFAULT NULL,
  `infra_image_2`      VARCHAR(500) DEFAULT NULL,
  `infra_image_3`      VARCHAR(500) DEFAULT NULL,
  `infra_image_4`      VARCHAR(500) DEFAULT NULL,
  `infra_image_5`      VARCHAR(500) DEFAULT NULL,
  `infra_image_6`      VARCHAR(500) DEFAULT NULL,
  `mgmt_title`         VARCHAR(255) DEFAULT 'Management Behind Dharti Amrut',
  `faq_data`           LONGTEXT     DEFAULT '[]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- about_us_members
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `about_us_members` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(150) NOT NULL,
  `designation`  VARCHAR(200) NOT NULL,
  `bio`          LONGTEXT     DEFAULT NULL,
  `member_image` VARCHAR(500) DEFAULT NULL,
  `sort_order`   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- oil_cake_price
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `oil_cake_price` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `price_per_kg`    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `min_quantity_kg` DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  `is_available`    TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `oil_cake_price` (`price_per_kg`, `min_quantity_kg`, `is_available`)
SELECT 0.00, 20.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `oil_cake_price` LIMIT 1);

-- ----------------------------------------------------------------
-- oil_cake_requests
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `oil_cake_requests` (
  `id`               INT           NOT NULL AUTO_INCREMENT,
  `user_id`          INT           NOT NULL,
  `quantity_kg`      DECIMAL(10,2) NOT NULL,
  `price_per_kg`     DECIMAL(10,2) NOT NULL,
  `total_amount`     DECIMAL(10,2) NOT NULL,
  `delivery_address` TEXT          DEFAULT NULL,
  `contact_number`   VARCHAR(15)   NOT NULL,
  `notes`            TEXT          DEFAULT NULL,
  `status`           ENUM('Pending','Confirmed','Processing','Delivered','Cancelled','Rejected')
                     NOT NULL DEFAULT 'Pending',
  `admin_note`       TEXT          DEFAULT NULL,
  `created_at`       DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_oilcake_requests_user` (`user_id`),
  CONSTRAINT `fk_oilcake_requests_user`
    FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
