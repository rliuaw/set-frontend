/* Copyright (c) 2017-2020 MIT 6.031 course staff, all rights reserved. */

function setGame() {
  
  var words = [
    [ 'red', 'orange', 'yellow', 'green', 'blue', 'purple', ],
    [ 'apple', 'bean', 'carrot', 'donut', 'eclair', 'flan', ],
    [ Math.floor(Math.random() * Math.pow(16, 3)).toString(16) ],
  ];
  var playerID = words.map(function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }).join('_');
  console.log('generated player ID', playerID);
  
  var serverBox = document.getElementById('set-server');
  var playButton = document.getElementById('set-play');
  if (serverBox) {
    serverBox.addEventListener('keypress', function(e) {
      if (e.keyCode == 13) { serverBox.blur(); play(serverBox.value); }
    });
    if (playButton) {
      playButton.addEventListener('click', function() { play(serverBox.value); });
    }
  }
  var declareButton = document.getElementById('set-declare');
  declareButton.addEventListener('click', function() { declare(); });

  var boardTable = document.getElementById('set-board');
  boardTable.addEventListener('click', flip);
  
  var flippingCell = null;
  
  var scoreBox = document.getElementById('set-scores');
  
  var play = setGame.play = function play(server) {
    console.log('playing on server', server);
    if (serverBox) { serverBox.disabled = true; }
    if (playButton) { playButton.disabled = true; }
    setGame.server = server;
    watchAndUpdate();
  };
  
  function watchAndUpdate() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function onWatchLoad() {
      console.log('watch response', this.responseText.replace(/\r?\n/g, '\u21B5'));
      refreshBoard(this.responseText);
      setTimeout(watchAndUpdate, 1);
    });
    req.addEventListener('loadstart', function onWatchStart() {
      console.log('watch start');
      setTimeout(update, 1);
    });
    req.addEventListener('error', function onWatchError() {
      console.error('watch error', setGame.server);
    });
    req.open('GET', 'http://' + setGame.server + '/watch/' + playerID);
    console.log('sending watch request');
    req.send();
  }
  
  function update() {
    look();
    scores();
  }
  
  function look() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function onLookLoad() {
      console.log('look response', this.responseText.replace(/\r?\n/g, '\u21B5'));
      refreshBoard(this.responseText);
    });
    req.addEventListener('error', function onLookError() {
      console.error('look error', setGame.server);
    });
    req.open('GET', 'http://' + setGame.server + '/look/' + playerID);
    console.log('sending look request');
    req.send();
  }
  
  function scores() {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function onScoresLoad() {
      console.log('scores response', this.responseText.replace(/\r?\n/g, '\u21B5'));
      refreshScores(this.responseText);
    });
    req.addEventListener('error', function onScoresError() {
      console.error('scores error', setGame.server);
    });
    req.open('GET', 'http://' + setGame.server + '/scores');
    console.log('sending scores request');
    req.send();
  }

  function declare() {
    var url = setGame.server + '/declare/' + playerID;
    var req = new XMLHttpRequest();
    req.addEventListener('load', function onFlipLoad() {
      console.log('declare response', this.responseText.replace(/\r?\n/g, '\u21B5'));
      refreshBoard(this.responseText);
      // setTimeout(scores, 1);
    });
    // req.addEventListener('loadend', function onFlipDone() {
    //   flippingCell.classList.remove('card-blocked');
    //   flippingCell = null;
    // });
    req.addEventListener('error', function onFlipError() {
      console.error('declare error', url);
    });
    req.open('GET', 'http://' + url);
    console.log('sending declare request');
    req.send();
  }
  
  function flip(event) {
    if (event.target.tagName !== 'TD') { return; }
    if (flippingCell) {
      console.log('already waiting to flip a card');
      return;
    }
    
    flippingCell = event.target;
    flippingCell.classList.add('card-blocked');
    // 0-indexed, so use indexOf directly
    var col = indexOfElement(flippingCell);
    var row = indexOfElement(flippingCell.parentElement);
    var url = setGame.server + '/pick/' + playerID + '/' + row + ',' + col;
    var req = new XMLHttpRequest();
    req.addEventListener('load', function onFlipLoad() {
      console.log('flip response', this.responseText.replace(/\r?\n/g, '\u21B5'));
      refreshBoard(this.responseText);
      setTimeout(scores, 1);
    });
    req.addEventListener('loadend', function onFlipDone() {
      flippingCell.classList.remove('card-blocked');
      flippingCell = null;
    });
    req.addEventListener('error', function onFlipError() {
      console.error('flip error', url);
    });
    req.open('GET', 'http://' + url);
    console.log('sending flip request');
    req.send();
  }
  
  function indexOfElement(elt) {
    return Array.prototype.indexOf.call(elt.parentElement.children, elt);
  }
  
  function refreshBoard(text) {
    var board = text.split(/\r?\n/);
    var dims = board.shift().split('x');
    var rows = parseInt(dims.shift());
    var cols = parseInt(dims.shift());
    var declare = board.shift().split(' ');
    refreshDeclare(declare[0], declare[1]);
    var cards = board.map(function(line) { return line.split(' '); });
    
    for (var row = 0; row < rows; row++) {
      var tableRow = boardTable.children[row] ||
                     boardTable.appendChild(document.createElement('tr'));
      for (var col = 0; col < cols; col++) {
        var tableCell = tableRow.children[col] ||
                        tableRow.appendChild(document.createElement('td'));
        var card = cards.shift();
        refreshCell(tableCell, card[0], card[1]);
      }
    }
  }
  
  function refreshDeclare(status, millis) {
    // text = text.replace(/\//g, '\n'); // formats card
    declareButton.classList.remove('hidden');
    declareButton.classList.remove('disabled');
    declareButton.classList.remove('btn-info');
    declareButton.classList.remove('btn-success');
    // declareButton.innerText = '';
    if (status === 'none') {
      declareButton.classList.add('btn-info');
    } else if (status === 'up') {
      declareButton.classList.add('btn-info');
      declareButton.classList.add('disabled');
      // declareButton.innerText = text;
    } else if (status === 'my') {
      declareButton.classList.add('btn-success');
      // declareButton.innerText = text;
    } else {
      console.error('invalid declare button', status, millis);
    }
    console.log(declareButton.classList)
  }

  function refreshCell(tableCell, status, text) {
    text = text.replace(/\//g, '\n'); // formats card
    tableCell.classList.remove('card-visible');
    tableCell.classList.remove('card-control');
    tableCell.innerText = '';
    if (status === 'none') {
      tableCell.classList.add('card-visible');
    } else if (status === 'down') {
      tableCell.innerText = '?';
    } else if (status === 'up') {
      tableCell.classList.add('card-visible');
      tableCell.innerText = text;
    } else if (status === 'my') {
      tableCell.classList.add('card-visible');
      tableCell.classList.add('card-control');
      tableCell.innerText = text;
    } else {
      console.error('invalid board cell', status, text);
    }
    nightModeAddElement(tableCell);
  }
  
  function refreshScores(text) {
    scoreBox.innerText = '';
    var scores = text.split(/\r?\n/).filter(function(line) {
      return line;
    }).map(function(line) {
      return line.split(' ');
    });
    scores.forEach(function(score) {
      var row = document.createElement('tr');
      var cellTag = score[0] === playerID ? 'th' : 'td';
      row.appendChild(document.createElement(cellTag)).innerText = score[0];
      row.appendChild(document.createElement(cellTag)).innerText = score[1];
      scoreBox.appendChild(row);
    });
  }
}
