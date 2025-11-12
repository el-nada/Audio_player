//Refrence: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor
const addBtn = document.getElementById("addButton");
const removeBtn = document.getElementById("removeButton");
const audio = new Audio("/audio files/Zai Shui Yi Fang Vocal only.mp3");
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audio);

// Create a compressor node
const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
compressor.knee.setValueAtTime(40, audioCtx.currentTime);
compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
compressor.attack.setValueAtTime(0, audioCtx.currentTime);
compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

// connect the AudioBufferSourceNode to the destination
source.connect(audioCtx.destination);
audio.play();
addBtn.onclick = () => {
    source.disconnect(audioCtx.destination);
    source.connect(compressor);
    compressor.connect(audioCtx.destination);
};

removeBtn.onclick = () => {    
    source.disconnect(compressor);
    compressor.disconnect(audioCtx.destination);
    source.connect(audioCtx.destination);    
};
