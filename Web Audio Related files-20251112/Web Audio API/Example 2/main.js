const playBtn = document.getElementById("playButton");
const pauseBtn = document.getElementById("pauseButton");
const stopBtn = document.getElementById("stopButton");


const audio = new Audio("/audio files/Zai Shui Yi Fang Vocal only.mp3");
const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audio);
const volume = audioContext.createGain();
volume.gain.value=0.5;
source.connect(volume);
volume.connect(audioContext.destination);

audio.addEventListener("canplaythrough",()=>{
   playBtn.addEventListener("click", ()=>{
       if(audioContext.state == "suspended"){
           audioContext.resume();
       }
       audio.play();
   });
});


pauseBtn.addEventListener("click", ()=>{
    audio.pause();
});


stopBtn.addEventListener("click", ()=>{
    audio.pause();
    audio.currentTime=0;
});