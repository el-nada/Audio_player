// Global Variables for Audio 
let audioContext = null;
let audioBuffer = null;
let sourceNode = null; 
let analyserNode = null; 

let gainNode = null;
let filter = null; 

let isPlaying = false;
let animationId = null;

// For pausing or resuming the audio 
let startTime = 0;     
let pauseOffset = 0;

// Visualizing the audio 
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const FFT_SIZE = 2048;

// Select the buttons by their IDs
const selectBtn = $('#select_audio');
const startBtn  = $('#start_button');
const stopBtn   = $('#stop_button');
const saveBtn   = $('#save_button');
const volumeSld   = $('#volume_slider');
const filterFreqSlider = $('#filter_freq');
const filterQSlider    = $('#filter_q');
const filterGainSlider = $('#filter_gain');

// Initialize AudioContext once 
function ensureAudioContext() {
    if (!audioContext) {
        const AudioContext = window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
        audioContext = new AudioContext();
    }
}

// Create analyser and gain for visualizer, volume control and filter 
function ensureNodes() {
    ensureAudioContext();
    if (!analyserNode) {
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = FFT_SIZE;
    }
    if (!gainNode) {
        gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
    }
    if (!filter) {
        filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1000;
    }
}


// Create a new buffer source to play the audio
function createSource() {
    if (!audioBuffer) return null; // Check if there is an audio that can be played
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    // Connect the audio nodes to keep the visualization and volume consistent
    source.connect(filter);
    filter.connect(gainNode); 
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
    return source;
}

// Load audio from a File object
function loadFileAsAudio(file) {
    ensureAudioContext(); // Ensure the audio context exists, if not create it 
    const reader = new FileReader();
    reader.onload = async function(e) {
        const arrayBuffer = e.target.result;
        try {
            // Decode the audio data 
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            // Reset playback state 
            pauseOffset = 0;
            startTime = 0;
            isPlaying = false;
            startBtn.val('Play');
            // Update visualizer 
            clearCanvas();
            drawMessage('Loaded: ' + file.name);
        } catch (err) {
            console.error('decodeAudioData error:', err);
            alert('Could not decode audio file.');
        }
    };
    reader.onerror = function(err) {
        console.error('FileReader error', err);
        alert('Could not read audio file');
    };
    reader.readAsArrayBuffer(file);
}

// Play the audio 
function play() {
    if (!audioBuffer) {
        alert('No audio loaded. Please Select an audio file first.');
        return;
    }

    ensureNodes();

    // If context is suspended, resume it
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Create a new source node each time 
    sourceNode = createSource();
    if (!sourceNode) return;

    // Start from pauseOffset
    startTime = audioContext.currentTime - pauseOffset;
    sourceNode.start(0, pauseOffset);
    isPlaying = true;
    startBtn.val('Pause');

    // Start visualization
    startVisualization();

    // When playback ends, reset flags
    sourceNode.onended = function() {
        if (isPlaying) {
            stop(); // resets offsets and UI
        }
    };
}

// Pause the audio 
function pause() {
    if (!isPlaying || !sourceNode) return;
    try {
        sourceNode.stop(0);
    } catch (e) {
        console.warn('sourceNode stop error', e);
    }

    // Compute offset into buffer
    pauseOffset = audioContext.currentTime - startTime;
    // Clamp the offset duration between 0 and the duration of the audio to prevent errors 
    if (pauseOffset < 0) pauseOffset = 0;
    if (pauseOffset > audioBuffer.duration) pauseOffset = audioBuffer.duration;

    isPlaying = false;
    startBtn.val('Play');
    stopVisualization();
}

// Stop audio and reset variables
function stop() {
    if (sourceNode) {
        try {
            sourceNode.stop(0);
        } catch (e) {
            console.warn('sourceNode stop error', e);
        }
    }
    // Reset the state variables 
    sourceNode = null;
    isPlaying = false;
    pauseOffset = 0;
    startTime = 0;
    startBtn.val('Play');
    stopVisualization();
    clearCanvas();
}

// Visualize the waveforme
function startVisualization() {
    if (!analyserNode) return;
    const bufferLength = analyserNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    // Helper that is continuously called to draw the annimation
    function draw() {
        animationId = requestAnimationFrame(draw);
        // Get the waveform data 
        analyserNode.getByteTimeDomainData(dataArray);

        // Draw the background of the square 
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Start drawing the actual waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0f9';
        ctx.beginPath();

        // Compute the slicing width for the wave 
        const sliceWidth = canvasWidth / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0; // 0..2
            const y = (v * canvasHeight) / 2;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        ctx.lineTo(canvasWidth, canvasHeight / 2);
        ctx.stroke();
    }
    
    cancelAnimationFrame(animationId);
    // request to draw the annimation
    draw();
}

// Stop the visualization
function stopVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Erase what's written on the canvas
function clearCanvas() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// Writes a message on the canvas
function drawMessage(msg) {
    clearCanvas();
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(msg, 10, 24);
}

// Export the current audio
async function exportWavAndDownload(filename = 'edited_audio.wav') {
    if (!audioBuffer) {
        alert('No audio loaded to export.');
        return;
    }

    ensureAudioContext();

    // Create OfflineAudioContext with same sample rate and channel count as original
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length; 

    const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);
    
    // Create buffer source in offline context
    const offlineSource = offlineCtx.createBufferSource();
    offlineSource.buffer = audioBuffer;

    // Add the filter here 
    const offlineFilter = offlineCtx.createBiquadFilter(); 
    if (filter) {
        offlineFilter.type = filter.type;
        offlineFilter.frequency.value = filter.frequency.value;
        offlineFilter.Q.value = filter.Q.value;
        offlineFilter.gain.value = filter.gain.value;
    }

    // Recreate gain with same value (Relevent if we add a change gain functionnality)
    const offlineGain = offlineCtx.createGain();
    offlineGain.gain.value = gainNode ? gainNode.gain.value : 1.0;
    
    // Build the chain 
    offlineSource.connect(offlineFilter); 
    offlineFilter.connect(offlineGain);
    offlineGain.connect(offlineCtx.destination);

    // Start rendering
    offlineSource.start(0);

    drawMessage('Rendering audio for export.');

    try {
        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = bufferToWavBlob(renderedBuffer);
        triggerDownload(wavBlob, filename);
        drawMessage('Export complete');
    } catch (err) {
        console.error('Offline render failed:', err);
        alert('Export failed.');
    }
}

// Convert AudioBuffer to WAV Blob
function bufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numChannels * 2; // 16-bit audio
    const bufferLength = 44 + buffer.length * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Write the WAV header
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + buffer.length * numChannels * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sampleRate * blockAlign) */
    view.setUint32(28, sampleRate * numChannels * 2, true);
    /* block align (channelCount * bytesPerSample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, buffer.length * numChannels * 2, true);

    // Write interleaved PCM samples
    let offset = 44;
    const channelData = [];
    for (let ch = 0; ch < numChannels; ch++) {
        channelData.push(buffer.getChannelData(ch));
    }

    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            // clamp sample
            let sample = Math.max(-1, Math.min(1, channelData[ch][i]));
            
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, sample, true);
            offset += 2;
        }
    }

    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Trigger the download of the audio file 
function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style = 'display: none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Link the right filter 
function addFilter(filterType) {
    ensureNodes();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    filter.type = filterType;
    
    // Set default values if the sliders are at their defaults
    filter.frequency.value = parseFloat(filterFreqSlider.val()) || 1000;
    filter.Q.value = parseFloat(filterQSlider.val()) || 1;
    filter.gain.value = parseFloat(filterGainSlider.val()) || 0;

    // Presets for resonant filters
    if (filterType == "lowpassRes") {
        filter.frequency.value = 800;
        filter.Q.value = 15;
    }

    if (filterType == "highpassRes") {
        filter.frequency.value = 3000;
        filter.Q.value = 12;
    }
}

// Linking all the buttons to the proper functions

// Link the select button to the file picker
selectBtn.on('click', function(e) {
    // create hidden file input
    const input = $('<input type="file" accept="audio/*">').css('display', 'none');
    input.on('change', function(ev) {
        const file = this.files && this.files[0];
        if (file) {
            ensureNodes();
            loadFileAsAudio(file);
        }
        input.remove();
    });
    $('body').append(input);
    input.trigger('click');
});

// Link the start button to the start function
startBtn.on('click', function(e) {
    ensureNodes();
    if (!audioBuffer) {
        alert('Please select an audio file first.');
        return;
    }
    if (!isPlaying) {
        play();
    } else {
        pause();
    }
});

// Link the stop button to the stop function
stopBtn.on('click', function(e) {
    stop();
});

// Link the save button to the export function
saveBtn.on('click', function(e) {
    exportWavAndDownload('edited_audio.wav');
});

// Linking all the filters to the proper function call 
$('#lowpass').on('click', () => addFilter('lowpass'));
$('#highpass').on('click', () => addFilter('highpass'));
$('#bandpass').on('click', () => addFilter('bandpass'));
$('#highshelf').on('click', () => addFilter('highshelf'));
$('#lowshelf').on('click', () => addFilter('lowshelf'));
$('#peaking').on('click', () => addFilter('peaking'));
$('#notch').on('click', () => addFilter('notch'));
$('#allpass').on('click', () => addFilter('allpass'));
$('#lowpassRes').on('click', () => addFilter('lowpassRes'));
$('#highpassRes').on('click', () => addFilter('highpassRes'));

// Link the volume slider to a volume change  
volumeSld.on('input', function() {
    if (gainNode) {
        gainNode.gain.value = parseFloat(this.value);
    }
});

filterFreqSlider.on('input', function() {
    if (filter) filter.frequency.value = parseFloat(this.value);
});

filterQSlider.on('input', function() {
    if (filter) filter.Q.value = parseFloat(this.value);
});

filterGainSlider.on('input', function() {
    if (filter) filter.gain.value = parseFloat(this.value);
});

// Initialize canvas background
clearCanvas();
drawMessage('No file loaded. Click Select.');
