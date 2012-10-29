// Copyright Google 2012 - All rights reserved.
// Author : zakelfassi@google.com (Zak)
// HTML5 Codelab in g|Senegal g|Cotedivoire and g|Maroc 2012.
// Djoodle : Djembe Doodle - Celebrating African Music !

// DONE (Zak) : handle multiple audio channels for a more realistic effect.
// TODO (Zak) : implement correct event listening for Djoodle object and lose the _this hack !

/**
 * @codelaboverview
 * Start the codelab by presenting the elements of HTML5 we are going to use :
 *   -Audio http://html5doctor.com/native-audio-in-the-browser/
 *   -Canvas https://developer.mozilla.org/en/Canvas_tutorial/Basic_animations
 *   -Localstorage http://playground.html5rocks.com/#localstorage
 *   -CSS3 (very basic stuff: text-shadow, box-shadow, transitions) for Djoodle description
 *   and presentation page.
 *   -HTML5 markup (also, very basic talk about new elements, usage, when & why).
 */


var Djoodle = {};


Djoodle = function() {
  /**
   * Wait until all the elemnts are loaded, otherwise (using 
   * document.onload = init(); in index.html will cause the canvas to stay empty,
   * because the images aren't loaded totally, yet !)
   */
  this.init();
};


/**
 * The canvas.
 */
Djoodle.prototype.mainCanvas = null; // The canvas HTML element.
Djoodle.prototype.ctx = null; // The canvas context.


/**
 * The 6 Djembes.
 * @type {array.<Image>}
 */
Djoodle.prototype.djembe = [];


//The record button.
Djoodle.prototype.recordButton = null;



/**
 * Initialisation of the Djoodle.
 */
Djoodle.prototype.init = function() {
  document.addEventListener("keypress", this.handleKeyPress.call(this, event), false);
  
  this.mainCanvas = document.getElementById('main-canvas');
  this.ctx = this.mainCanvas.getContext('2d');

  this.recordButton = document.getElementById('record-button');
  this.recordButton.addEventListener('click', this.handleRecordButton.call(this, event), false);
  
  //this.mainCanvas.addEventListener('mousedown', this.touchDjembe.call(this, event), false);
  

  var sprite = new Image();
  sprite.src = 'img/doodle-sprite.png';
  sprite.addEventListener('load', this.initCanvas.call(this), false);
  this.initSounds();
};


/**
 * Sets a global variable.
 * Used in recording and playback.
 */
Djoodle.prototype.song = null;


/**
 * Sets a global variable.
 * Used while saving/retrieving data from localstorage.
 */
Djoodle.APP_KEY = 'djoodle';


/**
 * Handles the keypress event.
 * Play Djembe with F-G-H/V-B-N keys !
 * @param {event} e The event; e.keycode returns ASCII code in webKit.
 */
Djoodle.prototype.handleKeyPress = function(e) {
  this.playDjembeByKeyCode(e.keyCode);
};


/**
 * Handles the touch event.
 * Play Djembe with your fingers !
 * @param {event} e The event.
 */
Djoodle.prototype.touchDjembe = function(e) {
  var w = this.djembeFrameWidth;
  var h = this.djembeFrameHeigh;
  var djembeNumber;
  djembeNumber = Math.floor(e.offsetX/w) + 1;
  //console.log('Djembe #' + djembeNumber);
  this.playDjembe(djembeNumber);
};


/**
 * Plays the i-Djembe based on ASCII code.
 * @param {number} code The key ASCII code.
 */
Djoodle.prototype.playDjembeByKeyCode = function(code) {
  //console.log(e.keyCode);
  switch(code) {
    case 102: //F
	  this.playDjembe(1);
	  break;
    case 103: //G
      this.playDjembe(2);
      break;
    case 104: //H
      this.playDjembe(3);
      break;
    case 118: //V
      this.playDjembe(4);
      break;
    case 98: //B
      this.playDjembe(5);
      break;
    case 110: //N
      this.playDjembe(6);
      break;
    default:
      console.log('Invalid key !'); // if any other key pressed. 
	}
	console.log('Current keycode : ' + code)
};


/****************************************
 *										                  *
 * The Djoodle sounds				         	*
 * Demonstrating the Sound API					        *
 *										                  *
 ****************************************/

Djoodle.prototype.channels = [];


/**
 * Initialize and preload the sounds.
 */
Djoodle.prototype.initSounds = function() {
  for(var i = 1; i <= 6; i++) {
    var a = new Audio( 'sounds/djembe' + i + '.mp3' );
    a.preload = 'auto';
    this.channels.push(a);
		debugger;
  }
};


/**
 * Play the selected Djembe (1 -> 6).
 * @param {number} n The Djembe number (order in the Djoodle).
 */
Djoodle.prototype.playDjembe = function(n) {
  //this.stopAllDjembes();
  //Create another node instance.
  var tmp = this.channels[n-1].cloneNode(true);
  tmp.play(); //Djembes are from 1-6 and channels is an array 0-5.
	this.createSoundwave(n);
};


/**
 * Stop all the Djembes currently playing (1 -> 6).
 */
Djoodle.prototype.stopAllDjembes = function() {
  for(var i = 1; i <= 6; i++) {
	this.channels[i-1].pause();
	this.channels[i-1].currentTime = 0;
  }
};



/****************************************
 *										                  *
 * The Djoodle animator				         	*
 * Demonstrating Canvas					        *
 *										                  *
 ****************************************/


/**
 * Canvas global variables.
 * @type {number}
 */
Djoodle.CANVAS_WIDTH = 800;
Djoodle.CANVAS_HEIGHT = 400;


// Full Sprite width = 800px
// Original AI width = 2213 px
// Scale = 0,3615 
Djoodle.prototype.djembeYPos = 241; // Where the Djembes are located within the sprite.
Djoodle.prototype.djembeXPos = 0; // By default, it's located on the very left.
Djoodle.prototype.djembeFrameWidth = 130; // Djembes frame width.
Djoodle.prototype.djembeFrameHeight = 210; // Djembes frame height.
Djoodle.prototype.djembeDrawingYPos = 50;

Djoodle.prototype.initCanvas = function() {
  for(var i = 0; i < 6; i++) {
    this.djembe[i] = new Image();
    this.djembe[i].src = 'img/doodle-sprite.png';
  }

  // Initialisation
  this.clearCanvas();
    
  var newDjembePosX = this.djembeXPos;
  var newDjembeDrawingPosX = this.djembeXPos;

  for(var i = 0; i < 6; i++) {
    // (image, x to get, y to get, width to get, height to get, x to put, y to put) 
    this.ctx.drawImage(this.djembe[i], newDjembePosX, this.djembeYPos,
        this.djembeFrameWidth, this.djembeFrameHeight,
        newDjembePosX, this.djembeDrawingYPos,
        this.djembeFrameWidth, this.djembeFrameHeight);
        
    // Sets the new Djembe position.        
    newDjembePosX = this.djembeFrameWidth * (i+1);
  }
  
  this.drawGoogleLogo();
  this.drawAfrica();
};


/**
 * Draw & Place the Google logo.
 */
Djoodle.prototype.drawGoogleLogo = function() {
  var googleLogo = new Image();
  googleLogo.src = 'img/doodle-sprite.png';

  this.ctx.drawImage(googleLogo, 0, 0,
      217, 78,
      400, 310,
      217, 78);  
};


/**
 * Draw & Place the Google logo.
 */
Djoodle.prototype.drawAfrica = function() {
  var africa = new Image();
  africa.src = 'img/doodle-sprite.png';

  this.ctx.drawImage(africa, 0, 78,
      217, 160,
      600, 250,
      217, 160);
};


/**
 * The soundwave.
 */
Djoodle.prototype.soundwave = null;
Djoodle.prototype.soundwaveXPos = null; // Where to get it.
Djoodle.prototype.soundwaveYPos = null; // Where to get it.
Djoodle.prototype.soundwaveDrawingXPos = 0; // Where to put it.
Djoodle.prototype.soundwaveDrawingYPos = 0; // Where to put it.
Djoodle.prototype.soundwaveFrameSize = null;
Djoodle.prototype.soundwaveSpriteIndex = 0;
Djoodle.prototype.timer = null;

/**
 * Creating the sound wave effect.
 * @param {number} i The positionning of the soundwave relative to the Djembe
 * pressed.
 */
Djoodle.prototype.createSoundwave = function(i) {
  if(!i) i=1;
  window.clearInterval(this.timer);
  
  this.soundwaveXPos = 0;
  this.soundwaveYPos = 451;
  this.soundwaveFrameSize = 43; //actually, 42.657 !
  
  this.soundwave = new Image();
  this.soundwave.src = 'img/doodle-sprite.png';
  
  this.timer = setInterval(this.animateSoundwave.call(this, i), 60);
};


/**
 * Animating the soundwave sprite.
 * @param {number} i The ID of the Djembe; this way, we can position the
 * soundwave properly on top of the active one.
 */

Djoodle.prototype.animateSoundwave = function(i) {
  //console.log(i);
  //debugger;
  this.soundwaveDrawingXPos = i * this.djembeFrameWidth - this.djembeFrameWidth/2 - this.soundwaveFrameSize / 2;
  this.soundwaveDrawingYPos = this.getDjembeYPos(i) + this.djembeDrawingYPos;
    
  this.ctx.drawImage(this.soundwave, this.soundwaveXPos, this.soundwaveYPos,
      this.soundwaveFrameSize, this.soundwaveFrameSize,
      this.soundwaveDrawingXPos, this.soundwaveDrawingYPos,
      this.soundwaveFrameSize, this.soundwaveFrameSize);
  // Move to next sprite.
  this.soundwaveXPos += this.soundwaveFrameSize;
  this.soundwaveSpriteIndex++;
  
  if(this.soundwaveSpriteIndex == 5) {
    window.clearInterval(this.timer);
    i = 0;
    this.initCanvas(); // Redraw the Djembes (but no soundwave).
    this.soundwaveSpriteIndex = 0;
  }
};


/**
 * Returns the Djembe 'real' Y position in the screen.
 * @return {number} y The Y pos.
 */
Djoodle.prototype.getDjembeYPos = function(i) {
  var y = 0;
  switch(i) {
    case 1:
      y = 0;
      break;
    case 2:
      y = 50;
      break;
    case 3:
      y = 50;
      break;
    case 4:
      y = 20;
      break;
    case 5:
      y = -20;
      break;
    case 6:
      y = 60;
      break;                              
  }
  return y;
};

/**
 * Clear the canvas to set up a new frame.
 */

Djoodle.prototype.clearCanvas = function() {
  this.ctx.clearRect(0, 0, Djoodle.CANVAS_WIDTH, Djoodle.CANVAS_HEIGHT);
};



/****************************************
 *										                  *
 * The Djoodle Player / Recorder		    *
 * Demonstrating Localstorage			      *
 *										                  *
 ****************************************/

/**
 * @type {array.<Object>} Contains the song data.
 */
Djoodle.prototype.song = new Array();


/**
 * Record button listener.
 * @param {event} e
 */
Djoodle.prototype.handleRecordButton = function(e) {
  if(this.recordButton.value == 'Record !') {
    this.recordButton.value = 'Stop recording !';
    this.startRecording();
  }
  else {
    this.recordButton.value = 'Record !';
    this.stopRecording();    
  }
};

/**
 * @type {number} Substracted from the final this.song.
 */
Djoodle.prototype.recordingStartTime = null;


/**
 * Start recording.
 * @return {array.<Object>}
 */
Djoodle.prototype.startRecording = function() {
	this.recordingStartTime = new Date().getTime();	
  // add keylisteners.

  document.addEventListener("keypress", this.recordKey(this, event), false);
  // add Timer.
  // Push {timestamp, keyvalue} into this.song.
};

/**
 * Record current key to this.song.
 * @param {event} e The keyboard event.
 */
Djoodle.prototype.recordKey = function(e) {
  var ascii = e.keyCode;
  //var song = new Array();
  this.song.push({'code': ascii, 'time': new Date().getTime()});
  //console.log(this.song);
};


/**
 * Stop recording.
 * @return {array.<Object>}
 */
Djoodle.prototype.stopRecording = function() {
  this.save(); // saves the song to localstorage.
  this.song = [];
	//document.removeEventListener();
};


/**
 * Playback.
 * @param {string} songId The song ID to play.
 */
Djoodle.prototype.playback = function(songId) {
  var data = this.getSongData(songId);
	this.playSongData(data);
};


/**
 * Saves the song into localstorage.
 * @param {array.<Object>} song The just-stopped playing song.
 */
Djoodle.prototype.save = function() {
	for(var i = 0; i < this.song.length; i++ ) {
		this.song[i].time = this.song[i].time - this.recordingStartTime;
	}
  // Save this.song to localstorage (using this.appkey).
  alert('Saved !');
	console.log(this.song);
	this.playSongData(this.song);
	
  this.loadSonglist();  
};


/**
 * Updates the songlist panel.
 */
Djoodle.prototype.loadSonglist = function() {
  var songlist = document.getElementById('saved-songs');
  //foreach element in localstorage by Djoodle.APP_KEY fetch + insert into songlist.
};


/**
 * Returns the song data Object (or array?).
 * @param {string} songId Return this song Id's data. Stored in localstorage.
 * @return {array.<Object>} songData
 */
Djoodle.prototype.getSongData = function(songId) {
  //foreach element in localstorage by this.appkey fetch.
  var data = [];
  
  return data;
};


/**
 * Plays the song given the song data.
 * @param {array.<Object>} songData The song data array.
 */
Djoodle.prototype.playSongData = function(songData) {
  // Sets a setTimeout function and plays keys according to playDjembe(n).
	var timeout = 0;
	setTimeout(function() {
		for (var i = 0; i < songData.length; i++) {
			var key = songData[i].code;
			timeout += songData[i].time;
			this.playDjembeByKeyCode.call(key);
		}
	}, timeout);
	
	/* DO WHILE would be a better solution to increment gradually the 'i' in setTimeout */
};