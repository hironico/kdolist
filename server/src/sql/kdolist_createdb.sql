SELECT datname FROM pg_database
WHERE datistemplate = false;

CREATE USER kdolistapp with password 'BLAbla123_kdolist';

CREATE DATABASE kdolist OWNER kdolistapp;