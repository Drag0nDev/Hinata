drop table ServerSettings;

create table ServerSettings (
serverId VARCHAR(255) NOT NULL,
prefix VARCHAR(255),
muteRoleId VARCHAR(255),
modlogChannel VARCHAR(255),
joinLeaveLogChannel VARCHAR(255),
memberLogChannel VARCHAR(255),
serverLogChannel VARCHAR(255),
messageLogChannel VARCHAR(255),
voiceLogChannel VARCHAR(255),
levelUpMessage VARCHAR(1000),
levelUpRoleMessage VARCHAR(1000),
noXpRole VARCHAR(255)
FOREIGN KEY (serverId) REFERENCES servers(serverId)
);

create table newServers (
serverName VARCHAR(255),
serverid VARCHAR(255) NOT NULL,
PRIMARY KEY (serverid)
);

insert into ServerSettings (serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, levelUpMessage, levelUpRoleMessage)
select serverId, prefix, muteRoleId, modlogChannel, joinLeaveLogChannel, levelUpMessage, levelUpRoleMessage
from servers;

insert into newServers (serverName, serverid)
select serverName, serverId
from servers;

drop table servers;

alter table newServers
rename to servers;

select * from ServerSettings;
select * from servers;