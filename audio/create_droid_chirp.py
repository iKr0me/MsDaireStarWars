"""Create an original temporary droid chirp, not a Star Wars audio extraction."""
from pathlib import Path
import math
import struct
import wave

RATE = 44100
DURATION = 1.12
# start, duration, start frequency, end frequency, gain
TONES = [(0.02, .16, 880, 1450, .24), (.23, .115, 1660, 1110, .20),
         (.41, .28, 680, 970, .22), (.77, .19, 1390, 1760, .19)]
samples = [0.0] * round(RATE * DURATION)
for start, duration, low, high, gain in TONES:
    for i in range(round(duration * RATE)):
        t = i / RATE
        envelope = min(t / .012, 1.0, (duration - t) / .03)
        envelope = max(0.0, envelope) ** 2
        phase = 2 * math.pi * (low * t + (high-low) * t*t / (2*duration))
        vibrato = .065 * math.sin(2*math.pi*35*t)
        value = math.sin(phase+vibrato) + .12*math.sin(2*phase)
        samples[round(start*RATE)+i] += gain * envelope * value
assert max(map(abs, samples)) < 1.0
target = Path(__file__).with_name('droid-chirp.wav')
with wave.open(str(target), 'wb') as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(RATE)
    output.writeframes(b''.join(struct.pack('<h', round(value*32767)) for value in samples))
print(f'Created {target.name}: {DURATION:.2f} seconds, {RATE} Hz, mono PCM')
