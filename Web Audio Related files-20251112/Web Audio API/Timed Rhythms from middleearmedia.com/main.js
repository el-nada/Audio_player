window.onload = init;

var context;
var bufferLoader;

function init() {
    try {
        context = new AudioContext();
    }
    catch(e) {
        alert("Web Audio API is not supported in this browser");
    }
    
    // Start loading the drum kit.
    bufferLoader = new BufferLoader(
        context,
        [
        "/audio files/kick.wav",
        "/audio files/snare.wav",
        "/audio files/hihat.wav"
        ],
        bufferLoadCompleted  
    );

    bufferLoader.load();
}

function playSound(buffer, time) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(time);
}

// Plays Rhythm 1
function startPlayingRhythm1(bufferList) {
    var kick = bufferList[0];
    var snare = bufferList[1];
    var hihat = bufferList[2];
    
    // We'll start playing the rhythm 100 milliseconds from "now"
    var startTime = context.currentTime + 0.100;
    
    var tempo = 120; // BPM (beats per minute)
    var quarterNoteTime = 60 / tempo;

    // Play the kick drum on beats 1, 2, 3, 4
    playSound(kick, startTime);
    playSound(kick, startTime + quarterNoteTime);
    playSound(kick, startTime + 2*quarterNoteTime);
    playSound(kick, startTime + 3*quarterNoteTime);

    // Play the snare drum on beats 2, 4
    playSound(snare, startTime + quarterNoteTime);
    playSound(snare, startTime + 3*quarterNoteTime);
    
    // Play the hi-hat every 16th note.
    for (var i = 0; i < 16; ++i) {
        playSound(hihat, startTime + i*0.25*quarterNoteTime);
    }
}

// Plays Rhythm 2
function startPlayingRhythm2(bufferList) {
    var kick = bufferList[0];
    var snare = bufferList[1];
    var hihat = bufferList[2];
    
    // We'll start playing the rhythm 100 milliseconds from "now"
    var startTime = context.currentTime + 0.100;
    
    var tempo = 80; // BPM (beats per minute)
    var quarterNoteTime = 60 / tempo;

    // Play the kick drum on beats 1, 2, 3, 4
    playSound(kick, startTime);
    playSound(kick, startTime + 0.5*quarterNoteTime);	
    playSound(kick, startTime + 1.75*quarterNoteTime);
    playSound(kick, startTime + 2*quarterNoteTime);
    playSound(kick, startTime + 2.5*quarterNoteTime);
	
    // Play the snare drum on beats 2, 4
    playSound(snare, startTime + quarterNoteTime);
    playSound(snare, startTime + 3*quarterNoteTime);
    playSound(snare, startTime + 3.75*quarterNoteTime);	
    
    // Play the hi-hat every 16th note.
    for (var i = 0; i < 16; ++i) {
        playSound(hihat, startTime + i*0.25*quarterNoteTime);
    }
    playSound(hihat, startTime + 3.125*quarterNoteTime);
	
}

function bufferLoadCompleted() {
	// Create three sources and buffers
    var kick = context.createBufferSource();
    var snare = context.createBufferSource();
    var hihat = context.createBufferSource();
    kick.buffer = bufferLoader.bufferList[0];
    snare.buffer = bufferLoader.bufferList[1];
    hihat.buffer = bufferLoader.bufferList[2];
}