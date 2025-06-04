import { useEffect, useRef, useState } from 'react';
import { Soundfont } from 'smplr';
import './App.css';

const STRINGS = [
	{ name: 'G', midi: 67 },
	{ name: 'D', midi: 62 },
	{ name: 'A', midi: 57 },
	{ name: 'E', midi: 52 },
	{ name: 'B', midi: 47 },
];
const FRET_COUNT = 13;
const KEYS = [
	'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'Fb', 'G', 'G#/Ab', 'A', 'A#', 'B'
];

// Helper to get the C major scale intervals (in semitones)
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];
const NOTE_TO_SEMITONE: Record<string, number> = {
	'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'Fb': 4, 'G': 7, 'G#/Ab': 8, 'A': 9, 'A#': 10, 'B': 11
};

function getNoteName(midi: number) {
	const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const note = NOTES[midi % 12];
	const octave = Math.floor(midi / 12) - 1;
	return `${note}${octave}`;
}

type BassInstrument = InstanceType<typeof Soundfont>;

const SCALE_TYPES = [
	{ label: 'Major', value: 'major' },
	{ label: 'Minor', value: 'minor' },
];

export default function App() {
	const [audioReady, setAudioReady] = useState(false);
	const [selectedString, setSelectedString] = useState<number | null>(null);
	const [playing, setPlaying] = useState<{ stringIdx: number; fret: number } | null>(null);
	const [selectedKey, setSelectedKey] = useState('C');
	const [selectedScale, setSelectedScale] = useState('major');
	const audioCtxRef = useRef<AudioContext | null>(null);
	const bassRef = useRef<BassInstrument | null>(null);

	useEffect(() => {
		const ctx = new window.AudioContext();
		audioCtxRef.current = ctx;
		const bass = new Soundfont(ctx, { instrument: 'electric_bass_finger' });
		bass.load.then(() => setAudioReady(true));
		bassRef.current = bass;
		return () => {
			ctx.close();
		};
	}, []);

	const handleFretClick = (stringIdx: number, fret: number) => {
		if (!audioReady || !bassRef.current || !audioCtxRef.current) return;
		audioCtxRef.current.resume();
		const midi = STRINGS[stringIdx].midi + fret;
		bassRef.current.start({ note: midi, velocity: 100 });
		// Only play the note, do not toggle selection
	};

	const handleStringClick = (stringIdx: number) => {
		setSelectedString((prev) => (prev === stringIdx ? null : stringIdx));
	};

	// Play C major scale on B, E, A, D, or G string from fret 0
	const playScale = async () => {
		if (!audioReady || !bassRef.current || !audioCtxRef.current) return;
		if (selectedString === null) return;
		await audioCtxRef.current.resume();
		// Get the open string midi
		const openMidi = STRINGS[selectedString].midi;
		// Get the root note offset for the selected key
		const keyOffset = NOTE_TO_SEMITONE[selectedKey] ?? 0;
		// Find the lowest fret on this string that matches the selected key
		// (so the root note is always >= open string)
		let rootFret = 0;
		while (((openMidi + rootFret) % 12) !== keyOffset && rootFret <= FRET_COUNT) {
			rootFret++;
		}
		// Build the scale frets for the selected key
		const scaleIntervals = selectedScale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
		const scaleFrets = scaleIntervals.map(interval => rootFret + interval);
		const midiNotes = scaleFrets.map(fret => openMidi + fret);
		for (let i = 0; i < midiNotes.length; i++) {
			setPlaying({ stringIdx: selectedString, fret: scaleFrets[i] });
			bassRef.current.start({ note: midiNotes[i], velocity: 100 });
			await new Promise((res) => setTimeout(res, 400));
			setPlaying(null);
		}
	};

	const isPlaying = (stringIdx: number, fret: number) =>
		playing && playing.stringIdx === stringIdx && playing.fret === fret;

	return (
		<div className="fretboard-container">
			<h1>5-String Bass Guitar Fretboard</h1>
			<div className="fretboard">
				<table>
					<thead>
						<tr>
							<th>String</th>
							{[...Array(FRET_COUNT + 1)].map((_, fret) => (
								<th key={fret}>{fret}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{STRINGS.map((string, stringIdx) => (
							<tr
								key={string.name}
								className={selectedString === stringIdx ? 'selected-row' : ''}
							>
								<td
									className={selectedString === stringIdx ? 'selected-fret' : ''}
									style={{ cursor: 'pointer' }}
									onClick={() => handleStringClick(stringIdx)}
								>
									{string.name}
								</td>
								{[...Array(FRET_COUNT + 1)].map((_, fret) => {
									const midi = string.midi + fret;
									const note = getNoteName(midi);
									const playingCell = isPlaying(stringIdx, fret);
									return (
										<td
											key={fret}
											className={playingCell ? 'playing-fret' : 'fret'}
											onClick={() => handleFretClick(stringIdx, fret)}
											style={{ cursor: audioReady ? 'pointer' : 'not-allowed' }}
										>
											{note}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
				{!audioReady && <div className="loading">Loading bass samples...</div>}
			</div>
			<div style={{ marginTop: 24, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
				<label htmlFor="key-select" style={{ marginRight: 8 }}>Key:</label>
				<select
					id="key-select"
					value={selectedKey}
					onChange={e => setSelectedKey(e.target.value)}
					style={{ fontSize: '1em', padding: '0.2em 0.5em' }}
				>
					{KEYS.map(key => (
						<option key={key} value={key}>{key}</option>
					))}
				</select>
				<label htmlFor="scale-select" style={{ marginLeft: 8, marginRight: 8 }}>Scale:</label>
				<select
					id="scale-select"
					value={selectedScale}
					onChange={e => setSelectedScale(e.target.value)}
					style={{ fontSize: '1em', padding: '0.2em 0.5em' }}
				>
					{SCALE_TYPES.map(scale => (
						<option key={scale.value} value={scale.value}>{scale.label}</option>
					))}
				</select>
			</div>
			<button
				style={{ marginTop: 8 }}
				onClick={playScale}
				disabled={selectedString === null}
			>
				Play Scale
			</button>
		</div>
	);
}
