// Script to generate simple WAV audio files for the music room demo
const fs = require('fs');
const path = require('path');

const musicDir = path.join(__dirname, 'public', 'music');
if (!fs.existsSync(musicDir)) {
    fs.mkdirSync(musicDir, { recursive: true });
}

// Generate a simple WAV file with a tone
function generateWav(filename, frequency, durationSec, sampleRate = 44100) {
    const numSamples = sampleRate * durationSec;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = numSamples * blockAlign;
    const fileSize = 36 + dataSize;

    const buffer = Buffer.alloc(44 + dataSize);
    let offset = 0;

    // RIFF header
    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(fileSize, offset); offset += 4;
    buffer.write('WAVE', offset); offset += 4;

    // fmt chunk
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4;     // chunk size
    buffer.writeUInt16LE(1, offset); offset += 2;      // PCM
    buffer.writeUInt16LE(numChannels, offset); offset += 2;
    buffer.writeUInt32LE(sampleRate, offset); offset += 4;
    buffer.writeUInt32LE(byteRate, offset); offset += 4;
    buffer.writeUInt16LE(blockAlign, offset); offset += 2;
    buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

    // data chunk
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;

    // Generate audio samples - simple melody using multiple frequencies for richness
    const freqs = Array.isArray(frequency) ? frequency : [frequency];

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let sample = 0;

        // Mix multiple frequencies for richer sound
        freqs.forEach((f, idx) => {
            // Add some variation over time
            const vibrato = 1 + 0.002 * Math.sin(2 * Math.PI * 5 * t);
            const envelope = Math.min(1, Math.min(t * 4, (durationSec - t) * 4)); // fade in/out
            const vol = 1 / freqs.length;

            // Create melody by changing frequency over time
            const section = Math.floor(t / (durationSec / 8)) % 8;
            const melodyMultiplier = [1, 1.125, 1.25, 1.333, 1.5, 1.333, 1.25, 1.125][section];

            sample += vol * envelope * Math.sin(2 * Math.PI * f * melodyMultiplier * vibrato * t);
        });

        // Soft clip
        sample = Math.tanh(sample * 0.8);

        const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 24000)));
        buffer.writeInt16LE(intSample, offset);
        offset += 2;
    }

    const filepath = path.join(musicDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`Generated: ${filename} (${(buffer.length / 1024).toFixed(1)} KB, ${durationSec}s)`);
}

// Generate 5 songs with different characteristics
const songs = [
    { file: 'song1.mp3', freq: [261.63, 329.63, 392.00], dur: 15, name: 'Chill Vibes' },      // C major chord
    { file: 'song2.mp3', freq: [293.66, 369.99, 440.00], dur: 12, name: 'Summer Breeze' },     // D major chord
    { file: 'song3.mp3', freq: [329.63, 415.30, 493.88], dur: 18, name: 'Night Drive' },       // E major chord
    { file: 'song4.mp3', freq: [349.23, 440.00, 523.25], dur: 16, name: 'Coffee Morning' },    // F major chord
    { file: 'song5.mp3', freq: [392.00, 493.88, 587.33], dur: 20, name: 'Ocean Waves' },       // G major chord
];

console.log('Generating sample music files...\n');
songs.forEach(s => {
    // Use .mp3 extension but generate WAV data (browser can play both)
    generateWav(s.file, s.freq, s.dur);
});
console.log('\nDone! All sample music files generated.');
