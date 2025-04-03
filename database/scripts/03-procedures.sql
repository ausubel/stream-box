USE stream_box;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_register_user//

CREATE PROCEDURE sp_register_user(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password_hash TEXT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_role_id INT
)
BEGIN
    INSERT INTO user(username, email, password_hash, first_name, last_name, role_id)
    VALUES(p_username, p_email, p_password_hash, p_first_name, p_last_name, p_role_id);
END//

DROP PROCEDURE IF EXISTS sp_get_user_details_by_email//

CREATE PROCEDURE sp_get_user_details_by_email(
    IN p_email VARCHAR(100)
)
BEGIN
    SELECT id, username, email, password_hash, first_name, last_name, role_id, status, last_login, created_at FROM user WHERE email = p_email;
END//

DROP PROCEDURE IF EXISTS sp_get_user_details_by_id//

CREATE PROCEDURE sp_get_user_details_by_id(
    IN p_id INT
)
BEGIN
    SELECT id, username, email, password_hash, first_name, last_name, role_id, status, last_login, created_at FROM user WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_get_profile_picture//

CREATE PROCEDURE sp_get_profile_picture(
    IN p_id INT
)
BEGIN
    SELECT profile_picture FROM user WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_get_user_details_by_username//

CREATE PROCEDURE sp_get_user_details_by_username(
    IN p_username VARCHAR(50)
)
BEGIN
    SELECT id, username, email, password_hash, first_name, last_name, role_id, status, last_login, created_at FROM user WHERE username = p_username;
END//

DROP PROCEDURE IF EXISTS sp_get_users//

CREATE PROCEDURE sp_get_users()
BEGIN
    SELECT id, username, email, first_name, last_name, role_id, status, last_login, created_at FROM user;
END//

DROP PROCEDURE IF EXISTS sp_update_user//

CREATE PROCEDURE sp_update_user(
    IN p_id INT,
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_role_id INT
)
BEGIN
    UPDATE user
    SET username = p_username,
        email = p_email,
        first_name = p_first_name,
        last_name = p_last_name,
        role_id = p_role_id
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_update_password_hash//

CREATE PROCEDURE sp_update_password_hash(
    IN p_id INT,
    IN p_password_hash TEXT
)
BEGIN
    UPDATE user
    SET password_hash = p_password_hash
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_change_role//

CREATE PROCEDURE sp_change_role(
    IN p_id INT,
    IN p_role_id INT
)
BEGIN
    UPDATE user
    SET role_id = p_role_id
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_change_status//

CREATE PROCEDURE sp_change_status(
    IN p_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE user
    SET status = p_status
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_update_last_login//

CREATE PROCEDURE sp_update_last_login(
    IN p_id INT,
    IN p_last_login TIMESTAMP
)
BEGIN
    UPDATE user
    SET last_login = p_last_login
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_update_profile_picture//

CREATE PROCEDURE sp_update_profile_picture(
    IN p_id INT,
    IN p_profile_picture LONGTEXT
)
BEGIN
    UPDATE user
    SET profile_picture = p_profile_picture
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_update_profile//

CREATE PROCEDURE sp_update_profile(
    IN p_id INT,
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50)
)
BEGIN
    IF p_username IN (SELECT username FROM user WHERE id != p_id) OR p_email IN (SELECT email FROM user WHERE id != p_id) THEN
        SELECT 'El nombre de usuario o el correo electrónico ya existe' AS message;
    ELSE
        UPDATE user
        SET username = p_username,
            email = p_email,
            first_name = p_first_name,
            last_name = p_last_name
        WHERE id = p_id;
        SELECT 'SUCCESS' AS message;
    END IF;
END//

-- Videos

DROP PROCEDURE IF EXISTS sp_create_video//

CREATE PROCEDURE sp_create_video(
    IN p_user_id INT,
    IN p_title VARCHAR(200),
    IN p_youtube_link TEXT,
    IN p_description TEXT,
    IN p_type VARCHAR(20),
    IN p_status VARCHAR(20),
    IN p_thumbnail TEXT,
    IN p_tags JSON
)
BEGIN
    INSERT INTO video (user_id, title, youtube_link, description, type, status, thumbnail)
    VALUES (p_user_id, p_title, p_youtube_link, p_description, p_type, p_status, p_thumbnail);

    SET @last_insert_id = LAST_INSERT_ID();

    INSERT INTO video_tag_map (video_id, tag_id)
    SELECT @last_insert_id, tag_id
    FROM JSON_TABLE(p_tags, '$[*]' COLUMNS (tag_id INT PATH '$')) AS tags_json;
END//

DROP PROCEDURE IF EXISTS sp_get_videos//

CREATE PROCEDURE sp_get_videos()
BEGIN
    SELECT v.id, v.user_id, v.title, v.youtube_link, v.description, v.type, v.status, v.thumbnail, v.created_at,
           (SELECT JSON_ARRAYAGG(vt.name)
            FROM video_tag_map vtm
            JOIN video_tag vt ON vtm.tag_id = vt.id
            WHERE vtm.video_id = v.id AND vt.status = 'activo') AS tags
    FROM video v
    WHERE v.status = 'activo'
    ORDER BY v.created_at DESC;
END//

DROP PROCEDURE IF EXISTS sp_get_videos_by_user//

CREATE PROCEDURE sp_get_videos_by_user(
    IN p_user_id INT
)
BEGIN
    SELECT v.id, v.user_id, v.title, v.youtube_link, v.description, v.type, v.status, v.thumbnail, v.created_at,
           (SELECT JSON_ARRAYAGG(vt.name)
            FROM video_tag_map vtm
            JOIN video_tag vt ON vtm.tag_id = vt.id
            WHERE vtm.video_id = v.id AND vt.status = 'activo') AS tags
    FROM video v
    WHERE v.status = 'activo' AND v.user_id = p_user_id
    ORDER BY v.created_at DESC;
END//

DROP PROCEDURE IF EXISTS sp_get_videos_by_type//

CREATE PROCEDURE sp_get_videos_by_type(
    IN p_type VARCHAR(20)
)
BEGIN
    SELECT v.id, v.user_id, v.title, v.youtube_link, v.description, v.type, v.status, v.thumbnail, v.created_at,
           (SELECT JSON_ARRAYAGG(vt.name)
            FROM video_tag_map vtm
            JOIN video_tag vt ON vtm.tag_id = vt.id
            WHERE vtm.video_id = v.id AND vt.status = 'activo') AS tags
    FROM video v
    WHERE v.status = 'activo' AND v.type = p_type
    ORDER BY v.created_at DESC;
END//

DROP PROCEDURE IF EXISTS sp_get_video_by_id//

CREATE PROCEDURE sp_get_video_by_id(
    IN p_id INT
)
BEGIN
    SELECT id, user_id, title, youtube_link, description, type, status, thumbnail, created_at, 
           (SELECT JSON_ARRAYAGG(vt.name)
            FROM video_tag_map vtm
            JOIN video_tag vt ON vtm.tag_id = vt.id
            WHERE vtm.video_id = id AND vt.status = 'activo') AS tags
    FROM video WHERE id = p_id AND status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_get_video_by_user_id//

CREATE PROCEDURE sp_get_video_by_user_id(
    IN p_user_id INT
)
BEGIN
    SELECT id, user_id, title, youtube_link, description, type, status, thumbnail, created_at,
           (SELECT JSON_ARRAYAGG(vt.name)
            FROM video_tag_map vtm
            JOIN video_tag vt ON vtm.tag_id = vt.id
            WHERE vtm.video_id = id AND vt.status = 'activo') AS tags
    FROM video WHERE user_id = p_user_id AND status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_update_video//

CREATE PROCEDURE sp_update_video(
    IN p_id INT,
    IN p_title VARCHAR(200),
    IN p_youtube_link TEXT,
    IN p_description TEXT,
    IN p_type VARCHAR(20),
    IN p_status VARCHAR(20),
    IN p_tags JSON,
    IN p_thumbnail TEXT
)
BEGIN
    UPDATE video
    SET title = p_title,
        youtube_link = p_youtube_link,
        description = p_description,
        type = p_type,
        status = p_status,
        thumbnail = p_thumbnail
    WHERE id = p_id;

    UPDATE video_tag_map
    SET status = 'suspendido'
    WHERE video_id = p_id;

    INSERT INTO video_tag_map (video_id, tag_id)
    SELECT p_id, tag_id
    FROM JSON_TABLE(p_tags, '$[*]' COLUMNS (tag_id INT PATH '$')) AS tags_json;
END//

DROP PROCEDURE IF EXISTS sp_delete_video//

CREATE PROCEDURE sp_delete_video(
    IN p_id INT
)
BEGIN
    UPDATE video SET status = 'suspendido' WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_get_video_tags//

CREATE PROCEDURE sp_get_video_tags()
BEGIN
    SELECT id, name FROM video_tag WHERE status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_get_video_tag_map//

CREATE PROCEDURE sp_get_video_tag_map(
    IN p_video_id INT
)
BEGIN
    SELECT id, video_id, tag_id FROM video_tag_map WHERE video_id = p_video_id AND status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_create_album//
CREATE PROCEDURE sp_create_album(
    IN p_user_id INT,
    IN p_title VARCHAR(100)
)
BEGIN
    INSERT INTO album (user_id, title) VALUES (p_user_id, p_title);
END//

DROP PROCEDURE IF EXISTS sp_get_albums//
CREATE PROCEDURE sp_get_albums()
BEGIN
    SELECT id, user_id, title, description, thumbnail, created_at FROM album WHERE status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_get_album_by_id//
CREATE PROCEDURE sp_get_album_by_id(
    IN p_id INT
)
BEGIN
    SELECT id, user_id, title, description, thumbnail, created_at FROM album WHERE id = p_id AND status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_get_album_by_user_id//
CREATE PROCEDURE sp_get_album_by_user_id(
    IN p_user_id INT
)
BEGIN
    SELECT id, user_id, title, description, thumbnail, created_at FROM album WHERE user_id = p_user_id AND status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_update_album//
CREATE PROCEDURE sp_update_album(
    IN p_id INT,
    IN p_title VARCHAR(100),
    IN p_description TEXT,
    IN p_thumbnail TEXT
)
BEGIN
    UPDATE album
    SET title = p_title,
        description = p_description,
        thumbnail = p_thumbnail
    WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_delete_album//
CREATE PROCEDURE sp_delete_album(
    IN p_id INT
)
BEGIN
    UPDATE album SET status = 'suspendido' WHERE id = p_id;
END//

DROP PROCEDURE IF EXISTS sp_aggregate_video_to_album//
CREATE PROCEDURE sp_aggregate_video_to_album(
    IN p_video_id INT,
    IN p_album_id INT
)
BEGIN
    INSERT INTO album_video_map (album_id, video_id) VALUES (p_album_id, p_video_id);
END//

DROP PROCEDURE IF EXISTS sp_get_videos_by_album_id//
CREATE PROCEDURE sp_get_videos_by_album_id(
    IN p_album_id INT
)
BEGIN
    SELECT id, user_id, title, youtube_link, description, type, status, thumbnail, created_at
    FROM video
    WHERE id IN (
        SELECT video_id
        FROM album_video_map
        WHERE album_id = p_album_id AND status = 'activo'
    ) AND status = 'activo';
END//

DROP PROCEDURE IF EXISTS sp_remove_video_from_album//
CREATE PROCEDURE sp_remove_video_from_album(
    IN p_video_id INT,
    IN p_album_id INT
)
BEGIN
    DELETE FROM album_video_map WHERE video_id = p_video_id AND album_id = p_album_id;
END//

-- Procedimiento para obtener todos los videos para moderación
DROP PROCEDURE IF EXISTS sp_search_videos//
CREATE PROCEDURE sp_search_videos(
    IN p_search_term VARCHAR(255)
)
BEGIN
    SELECT v.id, v.user_id, v.title, v.youtube_link, v.description, v.type, v.status, v.thumbnail, v.created_at,
           (SELECT JSON_ARRAYAGG(vt.name)
            FROM video_tag_map vtm
            JOIN video_tag vt ON vtm.tag_id = vt.id
            WHERE vtm.video_id = v.id AND vt.status = 'activo') AS tags,
           u.username AS channel_name
    FROM video v
    JOIN user u ON v.user_id = u.id
    LEFT JOIN video_tag_map vtm ON v.id = vtm.video_id
    LEFT JOIN video_tag vt ON vtm.tag_id = vt.id
    WHERE v.status = 'activo' 
    AND (
        v.title LIKE CONCAT('%', p_search_term, '%') OR
        u.username LIKE CONCAT('%', p_search_term, '%') OR
        v.description LIKE CONCAT('%', p_search_term, '%') OR
        vt.name LIKE CONCAT('%', p_search_term, '%')
    )
    GROUP BY v.id
    ORDER BY v.created_at DESC;
END//

-- Procedimiento para obtener todos los videos para moderación
DROP PROCEDURE IF EXISTS sp_get_all_videos_for_moderation//
CREATE PROCEDURE sp_get_all_videos_for_moderation()
BEGIN
    SELECT v.id, v.user_id, v.title, v.youtube_link, v.description, v.type, v.status, v.thumbnail, v.created_at,
           u.username as creator_username,
           (SELECT COUNT(*) FROM report r WHERE r.video_id = v.id AND r.status = 'pendiente') as report_count
    FROM video v
    JOIN user u ON v.user_id = u.id
    ORDER BY report_count DESC, v.created_at DESC;
END//

-- Procedimiento para eliminar un video por incumplimiento
DROP PROCEDURE IF EXISTS sp_delete_video_by_admin//
CREATE PROCEDURE sp_delete_video_by_admin(
    IN p_video_id INT,
    IN p_status VARCHAR(50)
)
BEGIN
    UPDATE video
    SET status = p_status
    WHERE id = p_video_id;
    
    -- Marcar todos los reportes relacionados como resueltos
    UPDATE report
    SET status = 'resuelto', resolved_at = CURRENT_TIMESTAMP
    WHERE video_id = p_video_id AND status = 'pendiente';
    
    SELECT 'SUCCESS' AS message;
END//

-- Procedimiento para crear un reporte de abuso
DROP PROCEDURE IF EXISTS sp_create_report//
CREATE PROCEDURE sp_create_report(
    IN p_video_id INT,
    IN p_user_id INT,
    IN p_reason VARCHAR(100),
    IN p_description TEXT
)
BEGIN
    INSERT INTO report(video_id, user_id, reason, description)
    VALUES(p_video_id, p_user_id, p_reason, p_description);
    
    SELECT LAST_INSERT_ID() as id;
END//

-- Procedimiento para obtener todos los reportes
DROP PROCEDURE IF EXISTS sp_get_all_reports//
CREATE PROCEDURE sp_get_all_reports()
BEGIN
    SELECT r.id, r.video_id, r.user_id, r.reason, r.description, r.status, r.created_at, r.resolved_at,
           v.title as video_title,
           u.username as reporter_username
    FROM report r
    JOIN video v ON r.video_id = v.id
    JOIN user u ON r.user_id = u.id
    ORDER BY r.status = 'pendiente' DESC, r.created_at DESC;
END//

-- Procedimiento para obtener los reportes de un usuario específico
DROP PROCEDURE IF EXISTS sp_get_user_reports//
CREATE PROCEDURE sp_get_user_reports(
    IN p_user_id INT
)
BEGIN
    SELECT r.id, r.video_id, r.user_id, r.reason, r.description, r.status, r.created_at, r.resolved_at,
           v.title as video_title,
           u.username as reporter_username
    FROM report r
    JOIN video v ON r.video_id = v.id
    JOIN user u ON r.user_id = u.id
    WHERE r.user_id = p_user_id
    ORDER BY r.created_at DESC;
END//

-- Procedimiento para obtener un reporte específico
DROP PROCEDURE IF EXISTS sp_get_report//
CREATE PROCEDURE sp_get_report(
    IN p_report_id INT
)
BEGIN
    SELECT r.id, r.video_id, r.user_id, r.reason, r.description, r.status, r.created_at, r.resolved_at,
           v.title as video_title,
           u.username as reporter_username
    FROM report r
    JOIN video v ON r.video_id = v.id
    JOIN user u ON r.user_id = u.id
    WHERE r.id = p_report_id;
END//

-- Procedimiento para marcar un reporte como resuelto
DROP PROCEDURE IF EXISTS sp_resolve_report//
CREATE PROCEDURE sp_resolve_report(
    IN p_report_id INT
)
BEGIN
    UPDATE report
    SET status = 'resuelto', resolved_at = CURRENT_TIMESTAMP
    WHERE id = p_report_id;
    
    SELECT 'SUCCESS' AS message;
END//

DELIMITER ;
