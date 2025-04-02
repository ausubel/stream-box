USE stream_box;

-- Roles
INSERT INTO role (id, name)
VALUES 
  (1, 'CREATOR'),
  (2, 'CONSUMER'),
  (3, 'ADMIN');

INSERT INTO user(username, email, password_hash, first_name, last_name, role_id)
VALUES
  ('admin', 'admin@stream-box.com', '$2b$12$GGEz9G0HtUXPTSsE.g2HSOZt7xgLH8WxEzQtHqKYtLO629jhkzpP6', 'Admin_Name', 'Admin', 3),
  ('creator', 'creator@stream-box.com', '$2b$12$GGEz9G0HtUXPTSsE.g2HSOZt7xgLH8WxEzQtHqKYtLO629jhkzpP6', 'Creator_Name', 'Creator', 1),
  ('consumer', 'consumer@stream-box.com', '$2b$12$GGEz9G0HtUXPTSsE.g2HSOZt7xgLH8WxEzQtHqKYtLO629jhkzpP6', 'Consumer_Name', 'Consumer', 2),
  ('testConsumer', 'testConsumer@stream-box.com', '$2b$12$GGEz9G0HtUXPTSsE.g2HSOZt7xgLH8WxEzQtHqKYtLO629jhkzpP6', 'Consumer_Name', 'Consumer', 2);

INSERT INTO video(user_id, title, youtube_link, description, TYPE, thumbnail)
VALUES
  (1, 'Video 1', 'https://youtu.be/UNsHu05UVeY?si=SDcLfXVsYO0ZYyvp', 'Description 1', 'grabado', NULL),
  (1, 'Video 2', 'https://youtu.be/ES60TsyqrAA?si=I7UsX8d5Z0jmviqk', 'Description 2', 'grabado', NULL),
  (2, 'Video 3', 'https://www.youtube.com/watch?v=O8ldvZVZ_cw', 'Description 3', 'grabado', NULL),
  (2, 'Video 4', 'https://www.youtube.com/watch?v=g3vbKsbx87I', 'Description 4', 'en_vivo', NULL),
  (2, 'Video 5', 'https://www.youtube.com/watch?v=jkP1Sw7M2iU', 'Bitcoin', 'en_vivo', NULL);

INSERT INTO video_tag (name)
VALUES
  ('Tag 1'),
  ('Tag 2'),
  ('Tag 3');

INSERT INTO video_tag_map (video_id, tag_id)
VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 3),
  (3, 2),
  (3, 3);

-- Albums
INSERT INTO album (user_id, title)
VALUES
  (1, 'Admin Favorites'),
  (2, 'Creator Collection'),
  (3, 'Consumer Watchlist');

-- Album Video Mappings
INSERT INTO album_video_map (album_id, video_id)
VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (2, 1),
  (3, 2),
  (3, 3);

