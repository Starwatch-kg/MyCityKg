-- Создание пользователя и базы данных для MyCityKg
CREATE USER mycitykg_user WITH PASSWORD 'mycitykg_password';
CREATE DATABASE mycitykg_db OWNER mycitykg_user;

-- Подключение к базе данных
\c mycitykg_db;

-- Создание расширения PostGIS для работы с геоданными
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Предоставление прав пользователю
GRANT ALL PRIVILEGES ON DATABASE mycitykg_db TO mycitykg_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mycitykg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mycitykg_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO mycitykg_user;

-- Предоставление прав на создание таблиц
ALTER USER mycitykg_user CREATEDB;
