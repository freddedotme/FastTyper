var ws = require('nodejs-websocket');
var fs = require("fs");

var players = [];
var counter = 0;

var dictionary = []; fetchDictionary();
var multiplier = 6;
var currentWord; updateRandomWord();
var timer = setInterval(game, 1 * 1000); game();

var server = ws.createServer(function (player){
  addPlayer(player);

  player.on('text', function(word) {
    if (word !== currentWord) return;
    var currentPlayer = getPlayer(player);
    if (!currentPlayer) return;
    if (currentPlayer.answered) return;

    currentPlayer.score += Math.pow(2, multiplier);
    currentPlayer.answered = true;
  });

  player.on('close', function(code, reason){
    removePlayer(player);
  });

}).listen(8001);

// -- player

function addPlayer(player){
  var newPlayer = {client:player, id:counter, score:0, emoji:getRandomEmoji(), answered:false}
  players.push(newPlayer);
  player.send('id:' + counter.toString());
  counter++;
}

function removePlayer(player){
  var indexPlayer= players.map(function(o) { return o.client; }).indexOf(player);
  if (indexPlayer > -1) players.splice(indexPlayer, 1);
}

function getPlayer(player){
  var indexPlayer= players.map(function(o) { return o.client; }).indexOf(player);
  if (indexPlayer > -1) return players[indexPlayer];
  return null;
}

function resetAnswered(){
  for (var i = 0; i < players.length; i++){
    players[i].answered = false;
  }
}

// -- word

function updateRandomWord(){
  var random = Math.floor(Math.random() * dictionary.length);
  currentWord = dictionary[random];
}

// -- game

function game(){
  if(multiplier <= 0){
    updateRandomWord();
    resetAnswered();
    multiplier = 5;
  }

  var gameInfo = '{"online":' + players.length + ',' +
                  '"multiplier":' + multiplier + ',' +
                  '"word":"' + currentWord + '",' +
                  '"players":' + JSON.stringify(players, filter) + '}';

  broadcast(gameInfo);
  multiplier--;
}

// -- misc

function getRandomEmoji(){
  var emojis = [0x1F601, 0x1F602, 0x1F603, 0x1F604, 0x1F605, 0x1F606, 0x1F607, 0x1F608, 0x1F609, 0x1F60A, 0x1F60B, 0x1F60C, 0x1F60D, 0x1F60F, 0x1F612, 0x1F613, 0x1F614, 0x1F61A, 0x1F61C];
  var random = Math.floor(Math.random() * emojis.length);
  return String.fromCodePoint(emojis[random]);
}

function filter(key, value){
  if (key == 'client') return undefined;
  return value;
}

function broadcast(message){
  for (var i = 0; i < players.length; i++){
    players[i].client.send(message);
  }
}

function fetchDictionary(){
  var fetch = fs.readFileSync('dictionary.txt').toString('utf-8');
  dictionary = fetch.split('\n');
}
