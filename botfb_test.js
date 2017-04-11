//***********************************
//*			Install Modules			*
//*---------------------------------*
//*	Plz install Nodejs first		*
//*									*
//*		Install with command		*
//*									*
//* npm install request				*
//* npm install facebook-chat-api	*
//*									*
//***********************************
// Facebook Chat API By Schmavery
// For more information, please read the document in Git_URL below
// Git_URL: https://github.com/Schmavery/facebook-chat-api
// My facebook: https://www.facebook.com/godkeima
//



const request = require("request");
const login = require("facebook-chat-api");
const readline = require("readline");
const fs = require("fs");
var SimsimiAnswered;
var patt = new RegExp("/cm"); //user command
var text;
var userName;
//change the number at "&ft=" to 1 for Bad Word Discriminator ( default: 0 )
const botkey = "http://www.simsimi.com/getRealtimeReq?uuid=UwmPMKoqosEETKleXWGOJ6lynN1TQq18wwvrmCy6IRt&lc=vn&ft=1&reqText=";


var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// BOT Reply to the other user
function botChat(api, event) {
	request(botkey + encodeURI(event.body), function(err, response, html)
	{
		if (err) return console.error(err);
		if (html.indexOf("502 Bad Gateway") > 0 || html.indexOf("respSentence") < 0) {
			api.sendMessage("Bot ngu bot không hiểu '3'", event.threadID);
		}
		text = JSON.parse(html);
		if (text.status == "200") {
			SimsimiAnswered = text.respSentence;
			api.sendMessage(SimsimiAnswered + "\n--------\nChào " + userName + "\nĐây là tin nhắn trả lời tự động\n--------", event.threadID);
			api.markAsRead(event.threadID);
			console.log("+Người gửi: " + userName + "\n\t->Tin nhắn: " + event.body);
			console.log("\t->Bot: " + SimsimiAnswered);
		}
	});
	return;
};


// For counting the number of message from a conversation between you and other user/group
function countMsg(api, event) {
	api.getThreadInfo(event.threadID, function(err, info){
 	 	if (err) return console.error(err);
 	 	
 	 	api.sendMessage("->Bot: Số tin nhắn đã gửi: " + info.messageCount, event.threadID);
 	 	api.markAsRead(event.threadID);
 	 	console.log("+Người gửi: " + userName + "\n\t->Tin nhắn: " + event.body);
		console.log("\t->Bot: " + "Số tin nhắn đã gửi: " + info.messageCount);
 	});
 	return;
};


// Some special command that only the user can execute
function userOnly(api, event) {
	if (/yaoming/.test(event.body)) {
		var msg = {
 			url: "https://media.giphy.com/media/YbAJ2yf0FzPkA/giphy.gif"
 		}
 		api.sendMessage(msg, event.threadID);
 		console.log("+Người gửi: " + userName + "\n\t->Tin nhắn: " + event.body);
	}
	else if (/lol/.test(event.body)) {
		var msg = {
 			url: "https://media.giphy.com/media/4c2fwTnIcS28U/giphy.gif"
 		}
 		api.sendMessage(msg, event.threadID);
 		console.log("+Người gửi: " + userName + "\n\t->Tin nhắn: " + event.body);
	}
	else if (/troll/.test(event.body)) {
		var msg = {
 			url: "https://media.giphy.com/media/Xr0PZnT8sl6U/giphy.gif"
 		}
 		api.sendMessage(msg, event.threadID);
 		console.log("+Người gửi: " + userName + "\n\t->Tin nhắn: " + event.body);
	}
	else if (/logmeout/.test(event.body)) {
		console.log("====> Đã đăng xuất <====");
		api.logout((err) => {
			if (err) return console.error(err);
		});
	}
 	return;
};

// An object that containt login info
//var obj = {appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))};

//			fix here			 here		
login({email: "godonlyknows381@gmail.com", password: "godknows381"},
function(err, api){
	if(err) {
		switch (err.error) {
			case "login-approval":
				console.log('Enter code > ');
				rl.on("line", function(line) {
					err.continue(line);
					rl.close();
				});
				break;
			default:
				console.error(err);
		}
		return;
	}
		//fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
	 
	api.setOptions({forceLogin: true, selfListen: true, listenEvents: true, logLevel: "silent"});
	
	var myID = api.getCurrentUserID();
	api.getUserInfo(myID, function(err, ret)
	{
		if (err) return console.error(err);
		for (var i in ret) {
			if (ret.hasOwnProperty(i) && ret[i].name)
				var yourName = ret[i].name;
		}
		console.log("=== Bạn hiện đang đăng nhập với tài khoảng: " + yourName + " ===");
	});

	api.listen(function(err, event)
	{
		switch (event.type) {
			case "typ":
				var uid; var x;
				if (event.isTyping) {
					api.getThreadInfo(event.threadID, function(err, info)
					{
						if (err) return console.error(err);
						for (var id in info.participantIDs) {
							if (info.participantIDs[id] == event.from) {
								uid = info.participantIDs[id];
							}
						}

						api.getUserInfo(uid, function(err, ret)
						{
							if (err) return console.error(err);
							x = ret[uid].name;
							if (event.fromMobile) {
								console.log( x + " đang gửi tin từ điện thoại...");
							}
							else {
								console.log( x + " đang gửi tin từ máy tính...");
							}
						});						
					});
				}
				break;
			case "message":
				if (event.isGroup == true)
				{
					api.getUserInfo(event.senderID, function(err, ret) {
						if (err) return console.error(err);
						userName = ret[event.senderID].name;
						
						if (event.body === "/count") {
							countMsg(api, event);
						}
						else if ((event.senderID === myID) && (patt.test(event.body) == true)) {
	 						userOnly(api, event);
						}
						else if (event.senderID !== myID && event.body !== "/count") {
							botChat(api, event);
						}
					});	
				}
				else if (event.isGroup == false)
				{
					api.getUserInfo(event.senderID, function(err, ret) {
						if (err) return console.error(err);
						userName = ret[event.senderID].name;
						
						if (event.body === "/count") {
							countMsg(api, event);
						}
						else if ((event.senderID === myID) && (patt.test(event.body) == true)) {
	 						userOnly(api, event);
						}
						else if (event.senderID !== myID && event.body !== "/count") {
							botChat(api, event);
						}
					});
				}
				break;
		}
	});
});