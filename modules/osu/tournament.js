const Banchojs = require("bancho.js");
const fs = require('fs');
const path = require('path');
var config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
var beatmaps = [1821081];
var currentBeatmapIndex = 0;
var lobby;

var bancho = new Banchojs.BanchoClient({ username: config.usernameIrc, password: config.passwordIrc, apiKey: config.apiOsuKey });



bancho.connect().then(async () => {
	console.log("[Osu! System] Are Ready !");
}).catch(console.error);


module.exports = {
	createRoom: async (message) => {
		const channel = await bancho.createLobby("Wibu's House: " + Math.random().toString(36).substring(8));
		lobby = channel.lobby;
		const password = Math.random().toString(36).substring(8);
		await Promise.all([lobby.setPassword(password), lobby.setMap(beatmaps[currentBeatmapIndex])]);
		console.log("Lobby created! Name: " + lobby.name + ", password: " + password);
		console.log("Multiplayer link: https://osu.ppy.sh/mp/" + lobby.id);
		await message.channel.send(
			":3 Ta-đa Tạo phòng thành công ! Sau đây là hướng dẫn sử dụng : \n```" +
			" - &osu addlist [playername] : để thêm tên một người vào danh sách mời sau này \n" +
			" - &osu invite [playername] : để mời một người vào phòng \n" +
			" - &osu inviteall : mời tất cả mọi người trong danh sách \n" +
			" - &osu viewlist : xem tất cả người chơi trong danh sách mời \n" +
			" - &osu addbm [link] : thêm beatmap vào list đợi ```" +
			" - &osu closeroom : đóng phòng vừa tạo ```" +
			"`Debug: Lobby created! Name: " + lobby.name + ", password: " + password + "`"
		);

		lobby.on("playerJoined", (obj) => {
			if (obj.player.user.id == "12517601") {
				lobby.setHost("#12517601");
			}
			if (obj.player.user.isClient())
				lobby.setHost("#" + obj.player.user.id);
		});

		channel.on("message", async (message) => {
			console.log(`${message.user.ircUsername}: ${message.message}`);
			let command = message.message.split(" ");
			if (command[0] != "&osu") {
				return;
			}
			command = command[1].split(" ");
			switch (command[0]) {
				case "addlist":
					let check_user = "0";
					data_array = JSON.parse(fs.readFileSync('./storage/user.json', 'utf8'));
					data_array.player_team.forEach(async (value, key) => {
						if (value == player_new) {
							check_user = "1";
						}
					});
					if (check_user != "1") {
						data_array.player_team.push(player_new);
						var final_json = JSON.stringify(data_array);
						//console.log(final_json);
						fs.writeFile('./storage/user.json', final_json, 'utf8', (err, data) => {

						});
						await channel.sendMessage(message.user.ircUsername + " Ok Senpai ! Thêm người chơi [" + player_new + "] vào danh sách thành công !");
					} else {
						await channel.sendMessage(">< người chơi [" + player_new + "] đã tồn tại trong danh sách !");
					}
					return;
				case "invite":
					await lobby.invitePlayer(command[1]);
					await channel.sendMessage(":3 Mời thành công người chơi [" + command[1] + "] !");
					return;
				case "inviteall":
					data_array = JSON.parse(fs.readFileSync('./storage/user.json', 'utf8'));
					data_array.player_team.forEach(async (value, key) => {
						await lobby.invitePlayer(value);
					});
					await channel.sendMessage(":3 Mời thành công tất cả người chơi trong danh sách !");
					return;
				case "viewlist":
					let player_list;
					data_array = JSON.parse(fs.readFileSync('./storage/user.json', 'utf8'));
					data_array.player_team.forEach(async (value, key) => {
						player_list = player_list + ", " + value;
					});
					await channel.sendMessage("Danh sách người chơi trong list gồm có: [" + player_list + "]");
					return;
				case "addbm":
					let id_beatmap = beatmapLinkExplode_tour(command[1])[3];
					beatmaps.push(id_beatmap);
					let point = beatmaps.length - currentBeatmapIndex;
					await channel.sendMessage(message.user.ircUsername + " Ok Senpai ! Thêm Beatmap vào hệ thống thành công ! Vị trí chờ: [" + point + "]");
					return;
				default:
					await channel.sendMessage("Lệnh không tồn tại!");
					return;
			}
		});

		lobby.on("matchFinished", () => {
			currentBeatmapIndex++;
			if (currentBeatmapIndex == beatmaps.length)
				currentBeatmapIndex = 0;
			lobby.setMap(beatmaps[currentBeatmapIndex]);
		});
	},
	closeRoom: async (message) => {
		console.log("Closing lobby !");
		if (typeof lobby !== "undefined") {
			await lobby.closeLobby();
			lobby = undefined;
			await message.channel.send(":3 Ta-đa Đóng phòng thành công !!");
		} else {
			await message.channel.send(">< Anh chưa có tạo phòng mà !");
		}
	},
	viewInviteList: async (message) => {
		let player_list;
		data_array = JSON.parse(fs.readFileSync('./storage/user.json', 'utf8'));
		data_array.player_team.forEach(async (value, key) => {
			player_list = player_list + "\n - " + value;
		});
		await message.channel.send("Danh sách người chơi trong list gồm có: ```" + player_list + "```");
	},
	invitePlayer: async (message) => {
		if (lobby != null) {
			data_array = JSON.parse(fs.readFileSync('./storage/user.json', 'utf8'));
			data_array.player_team.forEach(async (value, key) => {
				await lobby.invitePlayer(value);
			});
			await message.channel.send(":3 Mời thành công tất cả người chơi trong danh sách !");
		} else {
			await message.channel.send(">< Anh chưa có tạo phòng mà làm sao mời được :< !");
		}
	},
	inviteAlone: async (message, player_new) => {
		if (lobby != null) {
			await lobby.invitePlayer(player_new);
			await message.channel.send(":3 Mời thành công người chơi **" + player_new + "** !");
		} else {
			await message.channel.send(">< Anh chưa có tạo phòng mà làm sao mời được :< !");
		}
	},
	addPlayer: async (message, player_new) => {
		let check_user = "0";
		data_array = JSON.parse(fs.readFileSync('./storage/user.json', 'utf8'));
		data_array.player_team.forEach(async (value, key) => {
			if (value == player_new) {
				check_user = "1";
			}
		});
		if (check_user != "1") {
			data_array.player_team.push(player_new);
			var final_json = JSON.stringify(data_array);
			//console.log(final_json);
			fs.writeFile('./storage/user.json', final_json, 'utf8', (err, data) => {

			});
			await message.channel.send(":3 Thêm người chơi **" + player_new + "** vào danh sách thành công !");
		} else {
			await message.channel.send(">< người chơi **" + player_new + "** đã tồn tại trong danh sách !");
		}
	},
	beatmapLinkExplode_tour: (url) => {
		url = url.replace("https://", "").replace("http://", "");
		let split_level1 = url.split("/")[2];
		return {
			bms_id: split_level1.split("#")[0],
			bm_id: url.split("/")[3],
			mode: split_level1.split("#")[1]
		}
	}

}

process.on("SIGINT", async () => {
	console.log("Closing lobby and disconnecting...");
	if (typeof lobby !== "undefined") {
		await lobby.closeLobby();
		lobby = undefined;
	}
	bancho.disconnect();
	process.exit(1);
});

