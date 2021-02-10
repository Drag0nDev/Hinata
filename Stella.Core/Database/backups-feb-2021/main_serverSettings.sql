create table serverSettings
(
    id                  INTEGER
        primary key autoincrement,
    serverId            VARCHAR(255),
    prefix              VARCHAR(255),
    muteRoleId          VARCHAR(255),
    modlogChannel       VARCHAR(255),
    joinLeaveLogChannel VARCHAR(255),
    memberLogChannel    VARCHAR(255),
    serverLogChannel    VARCHAR(255),
    messageLogChannel   VARCHAR(255),
    voiceLogChannel     VARCHAR(255),
    levelUpMessage      VARCHAR(255),
    levelUpRoleMessage  VARCHAR(255),
    noXpRole            VARCHAR(255),
    joinMessage         VARCHAR(1000),
    joinMessageChannel  VARCHAR(255),
    leaveMessage        VARCHAR(1000),
    leaveMessageChannel VARCHAR(255)
);

INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (1, '762240863836569600', 'nigga', '786901348863967242', '806551957430206485', '806551731092848670', '806551842511126579', '806552013549731850', '806551902686674964', '806907141620367391', '{
"color": "BE4F70",
"title": "Level up",
"description": "Congratulations %mention% you just leveled up","fields": [{"name": "New level","value": "%level%", "inline": true}],
"thumbnail": "%avatar%"
}', '{
"color": "BE4F70",
"title": "Level up",
"description": "Congratulations %mention% you just leveled up",
"fields": [
{"name": "New level","value": "%level%", "inline": true},
{"name": "New role","value": "%role%", "inline": true}
],
"thumbnail": "%avatar%"
}', null, '{"color": "#00ff00","title": "New member join","description": "Welcome %mention% to **%server%**!","fields": [{"name": "membercount","value": "%members%"}],"thumbnail": "%avatar%"}', '762241329304305664', '{"color": "#ff0000","title": "Member left","description": "**%user%** left the server!","fields": [{"name": "membercount","value": "%members%"}],"thumbnail": "%icon%"}', '762241329304305664');
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (2, '706864695918723073', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (3, '697405041492885625', 'nigga', null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (4, '678884843228102666', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (5, '663137317745197076', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (6, '645047329141030936', null, null, null, '806527300908613674', '806527305924739072', '806527308772278293', '806527310966685696', '806527313272504340', '{
"color": "BE4F70",
"title": "Level up",
"description": "Congratulations %mention% you just leveled up","fields": [{"name": "New level","value": "%level%", "inline": true}],
"thumbnail": "%avatar%"
}', '{
"color": "BE4F70",
"title": "Level up",
"description": "Congratulations %mention% you just leveled up",
"fields": [
{"name": "New level","value": "%level%", "inline": true},
{"name": "New role","value": "%role%", "inline": true}
],
"thumbnail": "%avatar%"
}', null, '{"color": "#00ff00","title": "New member join","description": "Welcome %mention% to **%server%**!","fields": [{"name": "membercount","value": "%members%"}],"thumbnail": "%avatar%"}', '707334390497411102', '{"color": "#ff0000","title": "Member left","description": "**%user%** left the server!","fields": [{"name": "membercount","value": "%members%"}],"thumbnail": "%icon%"}', '707335006124507136');
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (7, '676232947350634516', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (8, '760920925532061696', null, '803402490762625064', null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO serverSettings (id, serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, memberLogChannel, serverLogChannel, messageLogChannel, voiceLogChannel, levelUpMessage, levelUpRoleMessage, noXpRole, joinMessage, joinMessageChannel, leaveMessage, leaveMessageChannel) VALUES (9, '783640524401541161', null, null, null, '807968226490712105', '807968230320635904', '807968233260318801', '807968235726700615', '807968238313930752', null, null, null, null, null, null, null);