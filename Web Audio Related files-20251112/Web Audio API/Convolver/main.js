//Reference: https://codepen.io/jHollond/pen/yXbZGj
// impulse responses by Fokke van Saane (http://fokkie.home.xs4all.nl/IR.htm)

var context = new AudioContext();
var audioElement = document.getElementById('player');
var carrier = context.createMediaElementSource(audioElement);
var convolver = context.createConvolver();
var dry = context.createGain();
var wet = context.createGain();

carrier.connect(convolver);

convolver.connect(wet);
carrier.connect(dry);

dry.connect(context.destination);
wet.connect(context.destination);

var mix = function(value) {
	dry.gain.value = ( 1.0 - value );
	wet.gain.value = value;
}

var loadImpulse = function ( fileName )
{
  var url = "http://files.andre-michelle.com/impulse/" + fileName;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function ()
  {
    context.decodeAudioData( request.response, function ( buffer ) {
      convolver.buffer = buffer;
    }, function (e) { console.log(e); } );
  };request.onerror = function (e)
  {
    console.log(e);
  };
  request.send();
};

loadImpulse(document.getElementById('impulse').value);
mix(1.0);

function changeValue(string,type)
{
  var value = parseFloat(string) / 100.0;

  switch(type)
  {
    case 'mix':
		mix(value);
      break;
  }
}