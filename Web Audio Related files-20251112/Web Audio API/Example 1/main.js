//// figure b. connections, LF0->VCA.gain, oscillator->VCA 
//Low-frequency oscillation (LFO) is an electronic frequency that is usually below 20 Hz and creates a rhythmic pulse or sweep.

var audioContext = new AudioContext();
var LFO = audioContext.createOscillator(); 
var VCA = audioContext.createGain();
var oscillator = audioContext.createOscillator();

const playBtn = document.getElementById("playButton");

playBtn.addEventListener("click", ()=>{
    // connections 
    LFO.connect(VCA.gain); 
    oscillator.connect(VCA); 
    VCA.connect(audioContext.destination);
    // set frequency 
    LFO. frequency.value = 4;
    // start oscillators 
    LFO.start(0); 
    oscillator.start(0);
});
