const playBtn = document.getElementById("playButton");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//set up the different audio nodes we will use for the app

const audio = new Audio("/audio files/Zai Shui Yi Fang Vocal only.mp3");
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
const distortion = audioCtx.createWaveShaper();
const gainNode = audioCtx.createGain();
const biquadFilter = audioCtx.createBiquadFilter();


playBtn.addEventListener("click", ()=>{

    // connect the nodes together

    source.connect(analyser);
    analyser.connect(distortion);
    distortion.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if(audioCtx.state == "suspended"){
        audioCtx.resume();
    }
    audio.play();

    // Manipulate the Biquad filter

    biquadFilter.type = "lowpass";
    //biquadFilter.type = "highpass";
    //biquadFilter.type = "bandpass";
    //biquadFilter.type = "lowshelf";
    //biquadFilter.type = "highshelf";
    //biquadFilter.type = "peaking";
    //biquadFilter.type = "notch";
    //biquadFilter.type = "allpass";
    biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
});