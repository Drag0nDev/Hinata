create table Timers
(
    id          INTEGER
        primary key autoincrement,
    guildId     VARCHAR(255),
    userId      VARCHAR(255),
    moderatorId VARCHAR(255),
    type        VARCHAR(255),
    expiration  VARCHAR(255),
    reason      VARCHAR(1000)
);

