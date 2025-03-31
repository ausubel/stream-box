USE mysql;

DROP DATABASE IF EXISTS stream_box;

CREATE DATABASE stream_box;

USE stream_box;

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL -- consumidor, creador, administrador
);

CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture TEXT,
    role_id INT REFERENCES role(id),
    status VARCHAR(20) DEFAULT 'activo', -- activo, suspendido
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE video (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    youtube_link TEXT NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('en_vivo', 'grabado')) NOT NULL,
    status VARCHAR(20) DEFAULT 'activo', -- activo, suspendido
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE video_tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'activo' -- activo, suspendido
);
CREATE TABLE video_tag_map (
    video_id INT REFERENCES video(id) ON DELETE CASCADE,
    tag_id INT REFERENCES video_tag(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);
CREATE TABLE album (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'activo', -- activo, suspendido
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE album_video_map (
    album_id INT REFERENCES album(id) ON DELETE CASCADE,
    video_id INT REFERENCES video(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'activo', -- activo, suspendido
    PRIMARY KEY (album_id, video_id)
);
CREATE TABLE report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (video_id) REFERENCES video(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);