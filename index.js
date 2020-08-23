// [$] node_modules
const Discord = require("discord.js");
const moment = require("moment");
const request = require('request-promise');

var client = new Discord.Client();
var privateVC = [];

var {
    prefix,
    prefix_child,
    token
} = require("./config/config.json");

// [$] modules custom
const inso = require("./modules/handle/inso");
const osu_tournament = require("./modules/osu/tournament");
const imis = require("./modules/handle/imis");
const music = require("./modules/music/youtube");

client.once("ready", () => {
    console.log("[Bot] Ready!");
});

client.once("disconnect", () => {
    console.log("Disconnect!");
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState !== null && newState.channelID === "726462397266788353") {
        if (privateVC.includes(oldState.channel)) {
            newState.setChannel(oldState.channel).catch(console.error);
            return;
        }
        let name = newState.member.displayName;
        newState.channel.clone({
            name: name + "'s Private Room",
            userLimit: 2,
        }).then(newChannel => {
            newState.setChannel(newChannel).catch(console.error);
            privateVC.push(newChannel);
        }).catch(console.error);

    } else if (privateVC.includes(oldState.channel)) {
        if (oldState.channel.members.size === 0) {
            oldState.channel.delete().catch(console.error);
            delete privateVC[privateVC.indexOf(oldState.channel)];
        }
    }
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") {
        imis.reply(message);
        return;
    }

    let msg = message.content;
    prefix_child.forEach((child) => {
        if (msg.startsWith(child)) msg = msg.replace(child, prefix);
    });
    // [!] init command
    let commandArgs = msg.slice(prefix.length, msg.length).split(" ");
    let commandLabel = commandArgs.shift().toLowerCase();

    if (!msg.startsWith(prefix)) return;

    switch (commandLabel.toLowerCase()) {
        case "pm":
            await message.author.send(".");
            return;
        case "help":
            await message.channel.send(
                "Cách sử dụng Bot **Loli Quốc Dân Shizuru** ! \n\n" +
                " **[Lệnh Nhạc]** \n\n" +
                "**&play** `[link youtube hoặc tên bài nhạc]` : add bài nhạc vào \n" +
                "**&skip** : Bỏ qua bài nhạc \n" +
                "**&skiplist** : Bỏ qua danh sách được thêm \n" +
                "**&loop** : Không chuyển qua bài tiếp theo \n" +
                "**&unloop** : Mở lại chức năng chuyển bài \n" +
                "**&list** : Xem danh sách bài hát đang đợi \n" +
                "**&stop** : Dừng lại \n\n" +
                " **[Lệnh Osu]** (Có thể sử dụng kể cả trong game) \n\n" +
                "**&osu player** `[Tên player]` : Xem thông tin người chơi \n" +
                "**&osu createroom** : Tạo phòng chơi mutilplayer \n" +
                "**&osu invite** `[Tên player]` : Mời người chơi vào phòng \n" +
                "**&osu closeroom** : Đóng phòng vừa tạo \n" +
                "**&osu addlist** `[Tên player]` : Thêm người chơi vào danh sách `thường xuyên` \n" +
                "**&osu viewlist** : Xem người chơi trong danh sách `thường xuyên` \n" +
                "**&osu inviteall** : Mời tất cả người chơi trong danh sách `thường xuyên` vào phòng vừa tạo \n\n" +
                " **[Lệnh Discord]** \n\n" +
                "**&uinfo** : Xem thông tin của bạn \n" +
                "**&userinfo** `[Tag hoặc Mention member]` : Xem thông tin của người khác \n\n"
                );
            return;
        case "loop":
            loop = 1;
            message.channel.send("**Ok! Đã thêm loop bài hiện tại thành công ! UwU**");
            return;
        case "unloop":
            loop = 0;
            message.channel.send("**Ok! Đã gỡ loop bài hiện tại thành công ! UwU**");
        case "play":
            if (music.addWWW(commandArgs.join(" ").split("/playlist?list=")[0]) == "https://www.youtube.com") {
                let body = await request({
                    url: 'http://bot.levelhigh.site/get_bot?q=' + music.addWWW(commandArgs.join(" ").split("/playlist?list=")[1]),
                    json: false
                });

                body = JSON.parse(body);
                console.log(body.length);
                if (typeof body !== 'undefined' && body.length > 0) {
                    await message.channel.send("**Ok ! " + body.length + " bài hát mới đã được thêm vào list từ: ** `" + commandArgs.join(" ") + "`");
                    await music.execute(message,  body, "2");
                    return;
                } else {
                    return await message.channel.send("**List này không hợp lệ Senpai à :<**");
                }
            } else if (music.addWWW(commandArgs.join(" ").split("/watch?v=")[0]) === "https://www.youtube.com") {
                await music.execute(message,  "", "0");
                return;
            } else if (commandArgs.join(" ").split("/")[2] === "soundcloud.com") {
                request({
                    url: 'https://bot.levelhigh.site/get_soundcloud.php?link=' + encodeURI(commandArgs.join(" ")),
                    json: false
                }, async function (error, response, body) {
                    console.log(body);
                    body = JSON.parse(body);
                    await music.execute(message,  body[0].url, "1");
                });
                return;
            } else {
                request({
                    url: 'http://bot.levelhigh.site/get_bot?q=' + encodeURI(commandArgs.join(" ")),
                    json: false
                }, async function (error, response, body) {
                    console.log(body);
                    body = JSON.parse(body);
                    await music.execute(message,  body[0].url, "1");
                });
                return;
            }
        case "list":
            music.list_music(message);
            return;
        case "skip":
            music.skip(message);
            return;
        case "skiplist":
            music.skiplist(message);
            return;
        case "stop":
            music.stop(message);
            return;
        //User info
        case "uinfo":
        case "userinfo":
            let userArray = message.content.split(" ");
            let userArgs = userArray.slice(1);
            let member = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0]) || message.member;

            if (member.presence.status === 'dnd') member.presence.status = 'Do Not Disturb';
            if (member.presence.status === 'online') member.presence.status = 'Online';
            if (member.presence.status === 'idle') member.presence.status = 'Idle';
            if (member.presence.status === 'offline') member.presence.status = 'Offline';

            let x = Date.now() - member.createdAt;
            let y = Date.now() - message.guild.members.cache.get(member.id).joinedAt;
            const joined = Math.floor(y / 86400000);

            const joineddate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss");
            let status = member.presence.status;

            const userEmbed = new Discord.MessageEmbed()
                .setAuthor(member.user.tag, member.user.displayAvatarURL())
                .setTimestamp()
                .setColor('BLUE')
                .setImage(member.user.displayAvatarURL())
                .addField("Member ID", member.id)
                .addField('Roles', `<@&${member._roles.join('> <@&')}>`)
                .addField("Account Created On:", ` ${moment.utc(member.user.createdAt).format("dddd, MMMM Do YYYY")}`, true)
                .addField('Joined the server At', `${joineddate} \n> ${joined} day(S) Ago`)
                .addField("Status", status)

            await message.channel.send(userEmbed);
            return;
        case "osu":
            switch (commandArgs.length) {
                case 1:
                    switch (commandArgs[0].toLowerCase()) {
                        case "createroom":
                            await osu_tournament.createRoom(message);
                            return;
                        case "inviteall":
                            await osu_tournament.invitePlayer(message);
                            return;
                        case "closeroom":
                            await osu_tournament.closeRoom(message);
                            return;
                        case "viewlist":
                            await osu_tournament.viewInviteList(message);
                            return;
                        default:
                            await message.channel.send("Lệnh không tồn tại!");
                            return;
                    }
                case 2:
                    switch (commandArgs[0].toLowerCase()) {
                        case "addlist":
                            await osu_tournament.addPlayer(message, commandArgs[1]);
                            return;
                        case "invite":
                            await osu_tournament.inviteAlone(message, commandArgs[1]);
                            return;
                        case "player":
                            inso.playerInfo(commandArgs[1], 0, message.channel);
                            return;
                        case "beatmap":
                            let botMsg;
                            await message.channel.send("**Đợi em xíu nha ＞︿＜**").then(sent => {
                                botMsg = sent
                            });
                            inso.beatmap(commandArgs[1], botMsg);
                            return;
                        default:
                            await message.channel.send("Lệnh không tồn tại!");
                            return;
                    }
                case 3:
                    switch (commandArgs[0].toLowerCase()) {
                        case "player":
                            let m;
                            switch (commandArgs[2].toLowerCase()) {
                                default:
                                case "osu":
                                case "osu!":
                                case "0":
                                    m = 0;
                                    break;
                                case "taiko":
                                case "osu!taiko":
                                case "1":
                                    m = 1;
                                    break;
                                case "catch":
                                case "osu!catch":
                                case "ctb":
                                case "osu!ctb":
                                case "2":
                                    m = 2;
                                    break;
                                case "mania":
                                case "osu!mania":
                                    m = 3;
                                    break;
                            }
                            await message.channel.send({
                                embed: inso.playerInfo(commandArgs[1], m)
                            });
                            return;
                        default:
                            await message.channel.send("Lệnh không tồn tại!");
                            return;
                    }
                default:
                    await message.channel.send("Sai cú pháp");
                    await message.channel.send("Cú pháp lệnh: `" + prefix + "osu \<\player\|\beatmap\>\ \<\id|\name\>`");
                    return;
            }
        default:
            await message.channel.send(`> ${msg}\n<@${message.author.id}> Em hổng hiểu cái này ＞﹏＜`);
            return;
    }
});

client.login(token).catch(console.error);