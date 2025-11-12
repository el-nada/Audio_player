//Refrence: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode
const playBtn = document.getElementById("playButton");
const stopBtn = document.getElementById("stopButton");
var audioContext;
var randomNoiseNode;
init();


async function init() {
    audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule("random-noise-processor.js");
    randomNoiseNode = new AudioWorkletNode(
        audioContext,
        "random-noise-processor"
    );
}

playBtn.addEventListener("click", ()=>{
    randomNoiseNode.connect(audioContext.destination);
});

stopBtn.addEventListener("click", ()=>{
    randomNoiseNode.disconnect(audioContext.destination);
});