CREATE DATABASE wst;

USE wst;

CREATE TABLE account
(
    id                      int NOT NULL AUTO_INCREMENT,
    name                    varchar(20) NOT NULL,
    user_name               varchar(20),
    twitter                 varchar(32),
    facebook                varchar(32),
    google                  varchar(32),
    github                  varchar(32),
    email                   varchar(256),
    password                varchar(64),
    country_code            varchar(4),
    phone_no                varchar(32),
    international_phone_no  varchar(32),
    authy_id                int,
    two_factor_auth         varchar(10),
    signup_id               varchar(32),
    invite_id               varchar(32),
    reset_id                varchar(32),
    change_id               varchar(32),
    change_email            varchar(256),
    crypto_type             tinyint NOT NULL,
    created_at              datetime NOT NULL,
    updated_at              datetime,
    deleted_at              datetime,
    PRIMARY KEY (id)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE delete_account
(
    id                      int NOT NULL AUTO_INCREMENT,
    name                    varchar(20) NOT NULL,
    user_name               varchar(20),
    twitter                 varchar(32),
    facebook                varchar(32),
    google                  varchar(32),
    github                  varchar(32),
    email                   varchar(256),
    password                varchar(64),
    country_code            varchar(4),
    phone_no                varchar(32),
    international_phone_no  varchar(32),
    authy_id                int,
    two_factor_auth         varchar(10),
    signup_id               varchar(32),
    invite_id               varchar(32),
    reset_id                varchar(32),
    change_id               varchar(32),
    change_email            varchar(256),
    crypto_type             tinyint NOT NULL,
    created_at              datetime NOT NULL,
    updated_at              datetime,
    deleted_at              datetime,
    PRIMARY KEY (id)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE login_history
(
    id                      int NOT NULL AUTO_INCREMENT,
    account_id              int NOT NULL,
    device                  varchar(256) NOT NULL,
    login_at                datetime,
    PRIMARY KEY (id)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE session
(
    id                      varchar(36) NOT NULL,
    account_id              int,
    command_id              varchar(32),
    message_id              varchar(256),
    sms_id                  varchar(32),
    sms_code                varchar(6),
    authy_uuid              varchar(36),
    created_at              datetime NOT NULL,
    updated_at              datetime,
    PRIMARY KEY (id)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
