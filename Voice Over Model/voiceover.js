// TODO: Replace the API key with a secure method of storing and accessing it
const API_KEY = "";
const API_URL = ``;

const voiceButton = document.getElementById('voiceButton');
const statusText = document.getElementById('statusText');
const outputText = document.getElementById('outputText');

// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.lang = 'en-US';

// Text-to-Speech setup
const speechSynthesis = window.speechSynthesis;
let utterance = new SpeechSynthesisUtterance();

// Select a female voice
function selectFemaleVoice() {
    const voices = speechSynthesis.getVoices();
    const femaleVoices = voices.filter(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('girl')
    );

    // Prefer Indian English voices if available
    const indianVoices = femaleVoices.filter(voice => 
        voice.lang.startsWith('en-IN')
    );

    if (indianVoices.length > 0) {
        return indianVoices[0];
    }

    // Fallback to other female voices
    if (femaleVoices.length > 0) {
        return femaleVoices[0];
    }

    // If no specific female voice, use default
    return voices.find(voice => voice.default) || voices[0];
}

// Wait for voices to be loaded
speechSynthesis.onvoiceschanged = () => {
    utterance.voice = selectFemaleVoice();
    utterance.pitch = 1;
    utterance.rate = 0.9;
};

let isRecording = false;

voiceButton.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    try {
        recognition.start();
        voiceButton.textContent = 'Stop';
        statusText.textContent = 'Listening...';
        isRecording = true;
    } catch (error) {
        console.error('Error starting recording:', error);
        statusText.textContent = 'Error starting recording';
    }
}

function stopRecording() {
    recognition.stop();
    voiceButton.textContent = 'Voice Model';
    statusText.textContent = 'Processing...';
    isRecording = false;
}

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    statusText.textContent = 'Generating response...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: transcript
                    }]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        outputText.textContent = aiResponse;
        statusText.textContent = 'Response generated';

        // Speak the response
        utterance.text = aiResponse;
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Error:', error);
        statusText.textContent = 'Error generating response';
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    statusText.textContent = `Error: ${event.error}`;
    voiceButton.textContent = 'Voice Model';
    isRecording = false;
};