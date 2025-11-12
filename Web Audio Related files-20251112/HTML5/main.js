const audio = new Audio("./audio files/Zai Shui Yi Fang Vocal only.mp3");
//const audio = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playButton");
const pauseBtn = document.getElementById("pauseButton");

 audio.addEventListener("canplaythrough",()=>{
    playBtn.addEventListener("click", ()=>{

        audio.play();
        audio.playbackRate=0.5;
    });
 });

pauseBtn.addEventListener("click", ()=>{
    audio.pause();
});
