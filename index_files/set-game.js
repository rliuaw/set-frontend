/* Copyright (c) 2017-2020 MIT 6.031 course staff, all rights reserved. */
function setGame() {

  var words = [
    ['red', 'orange', 'yellow', 'green', 'blue', 'purple', ],
    ['apple', 'bean', 'carrot', 'donut', 'eclair', 'flan', ],
    [Math.floor(Math.random() * Math.pow(16, 3)).toString(16)],
  ];
  var playerID = words.map(function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }).join('_');
  console.log('generated player ID', playerID);

  var graphicsConfig = {
    shape: {
      diamond: 'M1 74L35 2l36 73-36 74z',
      oval: 'M36 149c-19 0-34-15-34-33V35C2 16 17 1 36 1s34 15 34 34v81c0 18-15 33-34 33z',
      squiggle: 'M9.64,77.38C15.73,63.23,19.46,50.9,12,33.71,6.57,21.25-3.54,13.79,1.84,6.76c7.06-9.19,31.8-10.89,50.79,6.9,18.12,17,13.77,49.45,6.14,64.12-7,13.55-4.38,29.55,8.37,48.23C79.21,143.69,46,156.12,20.42,141.67-1.76,129.1-2.46,105.54,9.64,77.38Z'
    },
    color: {
      classic: {
        red: 'rgb(239, 62, 66)',
        green: 'rgb(0, 178, 89)',
        purple: 'rgb(73, 47, 146)'
      },
      alternate: {
        red: '#DF6747',
        green: '#FEBC38',
        purple: '#37AFA9'
      }
    },
    props: Object.keys({
      color: ['RED', 'GREEN', 'PURPLE'],
      number: ['ONE', 'TWO', 'THREE'],
      pattern: ['OPEN', 'SOLID', 'STRIPED'],
      shape: ['DIAMOND', 'OVAL', 'SQUIGGLE']
    }),
    svgNamespace: 'http://www.w3.org/2000/svg',
    viewBox: '-7 -7 82 164',
    fillFunctions: {
      solid: function(e, t) {
        return t[e]
      },
      striped: function(e) {
        return 'url(#'.concat(e, '-stripes)')
      },
      open: function() {
        return 'none'
      }
    },
    hexesMap: {
      ONE: 1,
      TWO: 2,
      THREE: 3
    }
  };

  var serverExpandButton = document.getElementById('set-server-expand');
  var serverBox = document.getElementById('set-server');
  var playButton = document.getElementById('set-play');
  if (serverBox) {
    serverBox.addEventListener('keypress', function(e) {
      if (e.keyCode == 13) {
        serverBox.blur();
        play(serverBox.value);
      }
    });
    if (playButton) {
      playButton.addEventListener('click', function() {
        play(serverBox.value);
      });
    }
    if (serverExpandButton) {
      serverExpandButton.addEventListener('click', function() {
        if (localStorage.getItem('advancedSettings') === 'enabled') {
          if (serverBox.classList.contains('expand-clicked')) { // Gives toggle behavior
            serverBox.classList.remove('expand-clicked');
          } else {
            serverBox.value = 'localhost:8080';
            serverBox.focus();
            serverBox.classList.add('expand-clicked');
          }
        }
      });
    }
  }
  var declareButton = document.getElementById('set-declare');
  var declareTicker = 0;
  declareButton.addEventListener('click', function() {
    declare();
  });

  var addCardsButton = document.getElementById('set-add-cards');
  addCardsButton.addEventListener('click', function() {
    addCards();
  });

  var boardTable = document.getElementById('set-board');
  boardTable.addEventListener('click', flip);

  var flippingCell = null;

  var scoreBox = document.getElementById('set-scores');

  var settingsMenuInitialize = function() {
    // Recover settings, then enable transitions only after loaded.
    // refreshNightMode();
    window.addEventListener('load', (event) => {
      var footer = document.getElementById('footer-night-mode');
      var dropupString = '<span class="btn-group dropup pull-left">'+
      '  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
      '     ⚙️ <span class="caret"></span>'+
      '  </button>'+
      '  <ul class="dropdown-menu panel text-muted" id="set-settings-menu"><div class="panel-body">'+
      '    <li><label for="enableadvanced">'+
      '      <input type="checkbox" id="enableadvanced" name="enableadvanced">Enable advanced settings</label></li>'+
      '    <li><label for="colorblindmode">'+
      '      <input type="checkbox" id="colorblindmode" name="colorblindmode">Colorblind mode</label></li>'+
      // '    <li><a href="#">Another action</a></li>'+
      // '    <li><a href="#">Something else here</a></li>'+
      // '    <li role="separator" class="divider"></li>'+
      // '    <li><a href="#">Separated link</a></li>'+
      '  </ul></div>'+
      '</span>';
        
      footer.insertAdjacentHTML('afterbegin', dropupString);

      var enableAdvancedInput = document.getElementById('enableadvanced');

      if (localStorage.getItem('advancedSettings') === 'enabled') {
        enableAdvancedInput.checked = true;
        if (serverBox) {
          serverBox.value = 'localhost:8080';
        }
      } else { // Defaults to unchecked, therefore OK
        if (serverBox) {
          serverBox.value = 'mdlu-rtliu-set-game.herokuapp.com';
        }
      }
      enableAdvancedInput.addEventListener('change', function() {
        if(enableAdvancedInput.checked) {
          localStorage.setItem('advancedSettings', 'enabled');
          if (serverBox) {
            serverBox.value = 'localhost:8080';
          }
        } else {
          localStorage.setItem('advancedSettings', 'disabled');
          if (serverBox) {
            serverBox.value = 'mdlu-rtliu-set-game.herokuapp.com';
          }
        }
      });

      var enableAlternateColor = document.getElementById('colorblindmode');

      if (localStorage.getItem('alternateColor') === 'enabled') {
        enableAlternateColor.checked = true;
      }
      enableAlternateColor.addEventListener('change', function() {
        if(enableAlternateColor.checked) {
          localStorage.setItem('alternateColor', 'enabled');
        } else {
          localStorage.setItem('alternateColor', 'disabled');
        }
        refreshCardColor();
      });

      var settingsMenu = document.getElementById('set-settings-menu');
      nightModeAddElement(settingsMenu);
    });;
  }();

  var play = setGame.play = function play(server) {
    console.log('playing on server', server);
    if (serverBox) {
      serverBox.disabled = true;
    }
    if (playButton) {
      playButton.disabled = true;
    }
    setGame.server = server;
    if (setGame.server === 'localhost:8080') {
      setGame.protocol = 'http://';
    } else {
      setGame.protocol = 'https://';
    }
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
    req.open('GET', setGame.protocol + setGame.server + '/watch/' + playerID);
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
    req.open('GET', setGame.protocol + setGame.server + '/look/' + playerID);
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
    req.open('GET', setGame.protocol + setGame.server + '/scores');
    console.log('sending scores request');
    req.send();
  }

  function addCards() {
    var url = setGame.server + '/add/' + playerID;
    var req = new XMLHttpRequest();
    req.addEventListener('load', function onFlipLoad() {
      console.log('add cards response', this.responseText.replace(/\r?\n/g, '\u21B5'));
      refreshScores(this.responseText);
    });
    req.addEventListener('error', function onFlipError() {
      console.error('add cards error', url);
    });
    req.open('GET', setGame.protocol + url);
    console.log('sending add cards request');
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
    req.open('GET', setGame.protocol + url);
    console.log('sending declare request');
    req.send();
  }

  function flip(event) {
    if (event.target.tagName !== 'TD') {
      return;
    }
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
    req.open('GET', setGame.protocol + url);
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
    addCardsButton.classList.remove('hidden');
    refreshDeclare(declare[0], declare[1]);
    var cards = board.map(function(line) {
      return line.split(' ');
    });

    for (var row = 0; row < rows; row++) {
      var tableRow = boardTable.children[row] ||
        boardTable.appendChild(document.createElement('tr'));
      for (var col = 0; col < cols; col++) {
        var tableCell = tableRow.children[col] ||
          tableRow.appendChild(document.createElement('td'));
        var card = cards.shift();
        refreshCell(tableCell, card[0], card[1]);
      }
      // delete old columns
      while (tableRow.childElementCount > cols) {
        tableRow.deleteCell(tableRow.childElementCount - 1);
      }
    }
    // delete old rows?? but assume constant 3 rows, so nah
  }

  function refreshDeclare(status, millis) {
    // text = text.replace(/\//g, '\n'); // formats card
    declareButton.classList.remove('hidden');
    declareButton.classList.remove('disabled');
    declareButton.classList.remove('btn-info');
    declareButton.classList.remove('btn-warning');
    declareButton.classList.remove('btn-success');
    declareButton.innerText = 'declare';
    if (status === 'none') {
      declareButton.classList.add('btn-info');
    } else if (status === 'up') {
      declareButton.classList.add('btn-warning');
      // declareButton.classList.add('disabled');
    } else if (status === 'my') {
      declareButton.classList.add('btn-success');
    } else {
      console.error('invalid declare button', status, millis);
      return;
    }
    refreshDeclareTicker(millis)
  }

  // time is a unix timestamp
  // returns a nice string
  function formatTime(time) {
    var ms = time % 1000;
    time = (time - ms) / 1000;
    var secs = time
    return `declare - ${ secs }.${ ms }`
  }

  function refreshDeclareTicker(millis) {
    clearInterval(declareTicker);
    if (millis) {
      declareTicker = setInterval(function() {
        var timeRemaining = millis - (new Date()).getTime();
        if (timeRemaining <= 0) {
          clearInterval(declareTicker);
          declareButton.innerText = 'declare';
        } else {
          declareButton.innerText = formatTime(timeRemaining);
        }
      });
    }
  }

  function refreshCell(tableCell, status, text) {
    tableCell.classList.remove('card-visible');
    tableCell.classList.remove('card-control');
    tableCell.innerText = '';
    if (status === 'none') {
      tableCell.classList.add('card-visible');
    } else if (status === 'down') {
      tableCell.innerText = '?';
    } else if (status === 'up') {
      tableCell.classList.add('card-visible');
      tableCell.appendChild(createCardContent(text));
    } else if (status === 'my') {
      tableCell.classList.add('card-visible');
      tableCell.classList.add('card-control');
      tableCell.appendChild(createCardContent(text));
    } else {
      console.error('invalid board cell', status, text);
    }
    nightModeAddElement(tableCell);
  }

  function createCardContent(text) {
    var cardContent = document.createElement('div');
    var props = text.split('/');
    var hexes = props.shift();
    var color = props.shift();
    var pattern = props.shift();
    var shape = props.shift();
    var colorLowerCase = color.toLocaleLowerCase();
    var patternLowerCase = pattern.toLocaleLowerCase();
    var shapeLowerCase = shape.toLocaleLowerCase();
    var colorConfig = readColorConfig(true);
    for (var i = 0; i < graphicsConfig.hexesMap[hexes]; i++) {
      var hexContent = document.createElementNS(graphicsConfig.svgNamespace, 'use');
      hexContent.setAttribute('xlinkHref', '#'.concat(shapeLowerCase, '-shape'));
      hexContent.setAttribute('href', '#'.concat(shapeLowerCase, '-shape'));
      hexContent.setAttribute('fill', graphicsConfig.fillFunctions[patternLowerCase](colorLowerCase, colorConfig));
      hexContent.setAttribute('stroke', colorConfig[colorLowerCase]);
      hexContent.setAttribute('stroke-width', 7);
      var hex = document.createElementNS(graphicsConfig.svgNamespace, 'svg');
      hex.setAttribute('viewBox', graphicsConfig.viewBox);
      hex.setAttribute('class', shapeLowerCase);
      hex.appendChild(hexContent);
      cardContent.appendChild(hex);
    }
    cardContent.style['pointer-events'] = 'none';
    cardContent.setAttribute('data-text', text);
    return cardContent;
  }

  function refreshCardColor() {
    var colorConfig = readColorConfig(true);
    for (var row = 0; row < boardTable.childElementCount; row++) {
      var tableRow = boardTable.children[row];
      for (var col = 0; col < tableRow.childElementCount; col++) {
        var tableCellDiv = tableRow.children[col].querySelector('div');
        var props = tableCellDiv.getAttribute('data-text').split('/');
        var hexes = props.shift();
        var color = props.shift();
        var pattern = props.shift();
        var colorLowerCase = color.toLocaleLowerCase();
        var patternLowerCase = pattern.toLocaleLowerCase();
        var cardHexes = tableCellDiv.querySelectorAll('svg > use');
        for (var i = 0; i < cardHexes.length; i++) {
          console.log(graphicsConfig.fillFunctions[patternLowerCase](colorLowerCase, colorConfig));
          cardHexes[i].setAttribute('fill', graphicsConfig.fillFunctions[patternLowerCase](colorLowerCase, colorConfig));
          cardHexes[i].setAttribute('stroke', colorConfig[colorLowerCase]);
        }
      }
    }
  }

  function readColorConfig(refresh) {
    if (localStorage.getItem('alternateColor') === 'enabled') {
      var colorConfig = graphicsConfig.color.alternate;
    } else {
      var colorConfig = graphicsConfig.color.classic;
    }
    if (refresh) {
      for (var color in colorConfig) {
        document.querySelector(`#${ color }-stripes > rect`).setAttribute('fill', colorConfig[color]);
      }
    }
    return colorConfig;
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
      row.appendChild(document.createElement(cellTag)).innerText = score[2];
      scoreBox.appendChild(row);
    });
  }
}