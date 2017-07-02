var socket = new WebSocket('ws://localhost:8001');
var init = true;
var pid;

socket.addEventListener('open', function (event){

});

socket.addEventListener('message', function (event){
  var word = document.getElementsByClassName('word')[0];
  var online = document.getElementsByClassName('online')[0];
  var multiplier = document.getElementsByClassName('multiplier')[0];
  var id = document.getElementsByClassName('id')[0];
  var status = document.getElementsByClassName('status')[0];
  var players = document.getElementsByClassName('players')[0];
  var answer = document.getElementsByClassName('answer')[0];

  if (init){
    if (event.data.indexOf('id:') !== -1){
      pid = parseInt(event.data.substr(event.data.indexOf(':') + 1));
      init = false;

      word.innerHTML = 'Fetching...';
      multiplier.innerHTML = 'Fetching...';
      id.innerHTML = pid + ' - 0';
      online.innerHTML = 'Fetching...';
    }
  }else{
    var data = JSON.parse(event.data);

    word.innerHTML = data.word;
    online.innerHTML = data.online;

    multiplier.innerHTML = data.multiplier;
    status.style.width = data.multiplier * 20 + '%';

    players.innerHTML = '';
    answer.disabled = false;
    answer.placeholder = 'Guess and press Enter';

    var ps = data.players;
    ps = ps.sort(function(a, b){return b.score - a.score});

    for (var i = 0; i < ps.length; i++){
      if (i >= 10) break;
      var uid = ps[i].emoji + ' #' + ps[i].id;
      var li = document.createElement('li');
      if (ps[i].id === pid){
        if (ps[i].answered){
          answer.disabled = true;
          answer.placeholder = 'Congrats! You guessed correct. Wait for next round.';
        }
        id.innerHTML = ps[i].score;
        uid = 'You: ' + uid;
        li.className = 'player';
      }
      if (ps[i].answered) li.style.backgroundColor = '#27ae60';
      li.innerHTML = uid + ' - ' + ps[i].score;
      players.appendChild(li);
    }
  }
});

document.getElementsByClassName('answer')[0].onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if (keyCode == '13'){
    socket.send(this.value);
    this.value = '';
    return false;
  }
}
