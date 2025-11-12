// Mouse Control and / or two tracks/panners
var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    sampleURL = 'https://dl.dropboxusercontent.com/s/qo2ootyr0ier8uh/dinky-jam-2.mp3',
    sampleBuffer, sound, playButton = document.querySelector('.play'),
    stopButton = document.querySelector('.stop'),
    loop = false, mousepan = false,
    loopButton = document.querySelector('.loop'),
    mousePanButton = document.querySelector('.mousepan'),
    panningSlider = document.querySelector('.panning-slider'),
    panningValue = document.querySelector('.panning-value'),
    pannner = audioContext.createStereoPanner();

// load our sound
init();

function init() {
    loadSound(sampleURL);
}

// listen for changes to panning slider and update
panningSlider.oninput = function () {
    pannner.pan.value = panningSlider.value;
    panningValue.innerHTML = panningSlider.value;
};

playButton.onclick = function () {
    playSound();
};

stopButton.onclick = function () {
    stopSound();
};

loopButton.onclick = function (event) {
    loop = event.target.checked;
    panningSlider.disabled = false;
};

// mouse movement panning
document.onmousemove = mousePan;

mousePanButton.onclick = function (event) {
    mousepan = event.target.checked;
    if(mousepan){
        panningSlider.disabled = true;
        document.documentElement.style.cursor="ew-resize";
    } else {
        panningSlider.disabled = false;
        document.documentElement.style.cursor="default";
    }
};

// function to load sounds via AJAX
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            sampleBuffer = buffer;
            playButton.disabled = false;
            playButton.innerHTML = 'play';
        });
    };
    request.send();
}

// setup sound, loop, and connect to destination
function setupSound() {
    sound = audioContext.createBufferSource();
    sound.buffer = sampleBuffer;
    sound.loop = loop;
    sound.connect(pannner);
    pannner.connect(audioContext.destination);
}

// play sound and enable / disable buttons
function playSound() {
    setupSound();
    UI('play');
    sound.start(0);
    sound.onended = function () {
        UI('stop');
    }
}

// stop sound and enable / disable buttons
function stopSound() {
    UI('stop');
    sound.stop(0);
}

function UI(state) {
    switch (state) {
        case 'play':
            playButton.disabled = true;
            stopButton.disabled = false;
            panningSlider.disabled = false;
            break;
        case 'stop':
            playButton.disabled = false;
            stopButton.disabled = true;
            panningSlider.disabled = true;
            break;
    }
}

function mousePan(e){
    if(mousepan){
        pannner.pan.value = (e.clientX / window.innerWidth) * 2 - 1;
    }
}


/* ios enable sound output */
window.addEventListener('touchstart', function(){
    //create empty buffer
    var buffer = audioContext.createBuffer(1, 1, 22050);
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}, false);