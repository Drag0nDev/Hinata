create table rewards
(
    id       INTEGER
        primary key autoincrement,
    serverId VARCHAR(255),
    xp       INTEGER,
    roleId   VARCHAR(255)
);

INSERT INTO rewards (id, serverId, xp, roleId) VALUES (1, '645047329141030936', 1000, '645273542161727508');
INSERT INTO rewards (id, serverId, xp, roleId) VALUES (2, '645047329141030936', 3250, '645273316776607744');
INSERT INTO rewards (id, serverId, xp, roleId) VALUES (3, '645047329141030936', 6750, '645273174426124298');
INSERT INTO rewards (id, serverId, xp, roleId) VALUES (4, '645047329141030936', 11500, '645272962987196436');
INSERT INTO rewards (id, serverId, xp, roleId) VALUES (5, '645047329141030936', 17500, '645272819281821766');
INSERT INTO rewards (id, serverId, xp, roleId) VALUES (6, '645047329141030936', 24750, '645272783315795969');
INSERT INTO rewards (id, serverId, xp, roleId) VALUES (7, '645047329141030936', 43000, '804632883163168768');