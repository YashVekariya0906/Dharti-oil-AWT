CREATE DATABASE IF NOT EXISTS dharti_oil;
USE dharti_oil;

-- Table for website texts and config
CREATE TABLE IF NOT EXISTS site_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  logo_text VARCHAR(255) NOT NULL,
  logo_highlight VARCHAR(255) NOT NULL,
  welcome_message VARCHAR(255) NOT NULL,
  discover_text TEXT NOT NULL
);

-- Insert initial website data
INSERT INTO site_config (logo_text, logo_highlight, welcome_message, discover_text) 
VALUES ('Dharti ', 'Oil', 'Welcome to Dharti Amrut', 'Discover the purest and natural oils for your health and cooking needs.');

-- Table for navbar
CREATE TABLE IF NOT EXISTS navbar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  logo VARCHAR(255) DEFAULT NULL,
  image1 VARCHAR(255) DEFAULT NULL,
  image2 VARCHAR(255) DEFAULT NULL,
  image3 VARCHAR(255) DEFAULT NULL,
  image4 VARCHAR(255) DEFAULT NULL,
  image5 VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial navbar data
INSERT INTO navbar (logo, image1, image2, image3, image4, image5) 
VALUES (NULL, NULL, NULL, NULL, NULL, NULL);

-- Table for products
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  description TEXT
);

-- Insert initial dummy products
INSERT INTO products (name, price, image_url, description) VALUES
('Groundnut Oil 1L', 250.00, NULL, '100% pure cold-pressed groundnut oil.'),
('Mustard Oil 1L', 180.00, NULL, 'Organic mustard oil for cooking.'),
('Sesame Oil 500ml', 300.00, NULL, 'Premium quality sesame oil.'),
('Coconut Oil 500ml', 220.00, NULL, 'Cold-pressed coconut oil for hair and body.');
