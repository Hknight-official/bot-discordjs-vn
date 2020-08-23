const ytdl = require('ytdl-core');

var type_song;
var serverQueue;
var queueConstruct;
module.exports = {
    type_song,
    loop: 0,
    queue: new Map(),
    serverQueue,
    queueConstruct,
    async execute (message, url, type) {
        const voiceChannel = message.member.voice.channel;
         this.serverQueue = this.queue.get(message.guild.id);
        if (!voiceChannel)
            return await message.channel.send(
                "Mô-shi Mô-shi :3 Anh vui lòng vào trong một kênh thoại thì em mới phát nhạc được !"
            ); 
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return await message.channel.send(
                "Em không có đủ quyền đâu :< !"
            );
        }
        console.log(type);
        let songInfo;
    
        if (!this.serverQueue) {
            this.queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                list: [],
                volume: 2,
                playing: true
            };
            if (type === "0") {
                songInfo = await ytdl.getInfo(message.content.split(" ")[1]);
                this.queueConstruct.songs.push({
                    title: songInfo.title,
                    url: songInfo.video_url
                });
            } else if (type === "1") {
                songInfo = await ytdl.getInfo(url);
                this.queueConstruct.songs.push({
                    title: songInfo.title,
                    url: songInfo.video_url
                });
            } else {
                this.queueConstruct.list.push(url);
            }
    
            this.queue.set(message.guild.id, this.queueConstruct);
            try {
                this.queueConstruct.connection = await voiceChannel.join();
                if (typeof this.queueConstruct.songs !== 'undefined' && this.queueConstruct.songs.length > 0) {
                        this.type_song = "1";
                        this.play(message.guild, this.queueConstruct.songs[0], this.queue);
                } else if (typeof this.queueConstruct.list !== 'undefined' && this.queueConstruct.list.length > 0){
                        this.type_song = "2";
                        this.play(message.guild, this.queueConstruct.list[0][0], this.queue);
                }
    
            } catch (err) {
                console.log(err);
                this.queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            if (type === "0") {
                songInfo = await ytdl.getInfo(message.content.split(" ")[1]);
                this.serverQueue.songs.push({
                    title: songInfo.title,
                    url: songInfo.video_url
                });
                return await message.channel.send(`🎶 **『 ${songInfo.title} 』** Đã thêm vào list nhạc !`);
            } else if (type === "1") {
                songInfo = await ytdl.getInfo(url);
                this.serverQueue.songs.push({
                    title: songInfo.title,
                    url: songInfo.video_url
                });
                return await message.channel.send(`🎶 **『 ${songInfo.title} 』** Đã thêm vào list nhạc !`);
            } else {
                this.serverQueue.list.push(url);
                return;
            }
        }
    },
    
    skiplist (message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "Baka ><! Vào bên trong một kênh thoại mới dừng được bài hát đấy nhé !"
            );
        if (!this.serverQueue)
            return message.channel.send("Ano :v không có list nhạc nào cả :< !");
        this.serverQueue.list.shift();
        this.serverQueue.connection.dispatcher.end();
    },
    
    skip (message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "Baka ><! Vào bên trong một kênh thoại mới dừng được bài hát đấy nhé !"
            );
        if (!this.serverQueue) {
            return message.channel.send("Ano :v không có bài hát nào trong list cả :< !");
        } else {
            this.serverQueue.connection.dispatcher.end();
            return message.channel.send("Yahoo ! Bỏ qua bài nhạc thành công !");
        }
    },
    
    stop (message) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "Baka ><! Vào bên trong một kênh thoại mới dừng được bài hát đấy nhé !"
            );
        this.serverQueue.songs = [];
        this.serverQueue.list = [];
        this.serverQueue.connection.dispatcher.end();
    },
    
    addWWW (url) {
        url = url.replace("https://youtube", "https://www.youtube");
        return url
    },
    
    play (guild, song, queue) {
        this.serverQueue = queue.get(guild.id);
        if (typeof song == 'undefined') {
            this.serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }
    
        const dispatcher = this.serverQueue.connection
            .play(ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }), {
                highWaterMark: 1
            })
            .on("finish", async () => {
                if (this.loop == 0) {
                    if (this.type_song == "1") {
                        this.serverQueue.songs.shift();
                    } else {
                        if (typeof this.serverQueue.songs !== 'undefined' && this.serverQueue.list.length > 0) {
                            this.serverQueue.list[0].shift();
                        } else {
                            this.serverQueue.list.shift();
                        }
    
                    }
                }
                if (typeof this.serverQueue.songs !== 'undefined' && this.serverQueue.songs.length > 0) {
                        this.type_song = "1";
                        this.play(guild, this.serverQueue.songs[0], queue);
                } else if (typeof this.serverQueue.list !== 'undefined' && this.serverQueue.list.length > 0){
                        this.type_song = "2";
                        this.play(guild, this.serverQueue.list[0][0], queue);
                } else {
                        this.serverQueue.voiceChannel.leave();
                        queue.delete(guild.id);
                        return;
                }
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(0.4);
        this.serverQueue.textChannel.send(
            "『 **" + song.title + "** 』 Đã được thiết lập quẩy lên nà UwU !!!\n "+
            "**❖ Link Youtube:** `" + song.url + "` "
        );
    },

    async list_music (message) {
        if (!this.serverQueue) {
            return await message.channel.send("Không có bài hát nào trong danh sách !");
        }
        let title_play;
        if (this.type_song == "2") {
            title_play = this.serverQueue.list[0][0].title;
        } else {
            title_play = this.serverQueue.songs[0].title;
        }
        let play_list = "Bài đang phát: 『 " + title_play + " 』\n";
        let id = 1;
        this.serverQueue.songs.forEach(async (value, key) => {
            play_list = play_list + "\n " + id + ". " + value.title;
            id++;
        });
        this.serverQueue.list.forEach(async (value, key) => {
            value.forEach(async (value, key) => {
                play_list = play_list + "\n " + id + ". " + value.title;
                id++;
            });
        });
        return await message.channel.send("Danh sách trong list theo thứ tự ⇊: ```" + play_list + "```");
    }
}