CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

CREATE TABLE boards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  title VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threads (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  op_post_id BIGINT NULL,
  title VARCHAR(255) NULL,
  bumped_at DATETIME NOT NULL,
  is_deleted TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (board_id, bumped_at),
  FOREIGN KEY (board_id) REFERENCES boards(id)
);

CREATE TABLE posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  thread_id BIGINT NOT NULL,
  user_id INT NULL,                        
  body TEXT NOT NULL,
  parent_post_id BIGINT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (thread_id, created_at),
  INDEX idx_posts_parent (parent_post_id),
  INDEX idx_posts_private (is_private),
  FOREIGN KEY (parent_post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

INSERT INTO boards (slug, title, created_at) VALUES
('b',  'Random / Neon Market', NOW()),
('ch', 'Chrome & Implants & Shelfware', NOW()),
('p',  'Pwn / Exploits & Zero-days', NOW()),
('vr',  'VR', NOW()),
('nmap',  'Net / Grid, Mesh & Switches', NOW()),
('s',  'Synth , Cyberware , Biolace', NOW()),
('o',  'Ops & OPSEC', NOW()),
('ai',  'AI Anomalies & Glitch', NOW());

INSERT INTO threads (board_id, title, bumped_at) VALUES
(1, '/b/ - Neon junk & market drops', NOW()),
(2, '/ch/ - Show your chrome: fresh installs, serials, side-effects', NOW() - INTERVAL 1 HOUR),
(3, '/p/ - Zero-day roundup: payloads / PoC / sigs', NOW() - INTERVAL 30 MINUTE),
(4, '/vr/ - Which simspace is bleeding credits today?', NOW() - INTERVAL 2 HOUR),
(5, '/nmap/ - East Grid outage map & router fingerprints', NOW() - INTERVAL 15 MINUTE),
(6, '/s/ - Biolace threads: injector tips, vendor leaks', NOW() - INTERVAL 45 MINUTE),
(7, '/o/ - Night drop log: beacon pings & safehouse OPSEC', NOW() - INTERVAL 3 HOUR),
(8, '/ai/ - Packet ghosts & hallucinating AI logs', NOW() - INTERVAL 10 MINUTE);


GRANT SELECT, INSERT, UPDATE, DELETE ON db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

SELECT 'Database schema initialized successfully!' AS message;
