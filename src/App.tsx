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

function getNoteName(midi: number) {
	const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const note = NOTES[midi % 12];
	const octave = Math.floor(midi / 12) - 1;
	return `${note}${octave}`;
}

type BassInstrument = InstanceType<typeof Soundfont>;

export default function App() {
	const [audioReady, setAudioReady] = useState(false);
	const [selectedString, setSelectedString] = useState<number | null>(null);
	const [playing, setPlaying] = useState<{ stringIdx: number; fret: number } | null>(null);
	const [selectedKey, setSelectedKey] = useState('C');
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
		let scaleFrets: number[] = [];
		let midiNotes: number[] = [];
		if (selectedString === 4) {
			// B string: C3, D3, E3, F3, G3, A3, B3, C4
			scaleFrets = [1, 3, 5, 6, 8, 10, 12, 13];
			midiNotes = scaleFrets.map(f => STRINGS[4].midi + f);
		} else if (selectedString === 3) {
			// E string: C4 (8), D4 (10), E4 (12), F4 (13), G3 (3), A3 (5), B3 (7), C4 (8)
			scaleFrets = [8, 10, 12, 13, 3, 5, 7, 8];
			midiNotes = scaleFrets.map(f => STRINGS[3].midi + f);
		} else if (selectedString === 2) {
			// A string: C3 (3), D3 (5), E3 (7), F3 (8), G3 (10), A3 (12), B3 (14), C4 (15)
			scaleFrets = [3, 5, 7, 8, 10, 12, 14, 15];
			midiNotes = scaleFrets.map(f => STRINGS[2].midi + f);
		} else if (selectedString === 1) {
			// D string: C4 (10), D4 (12), E4 (14), F4 (15), G4 (0), A4 (2), B4 (4), C5 (5)
			scaleFrets = [10, 12, 14, 15, 0, 2, 4, 5];
			midiNotes = scaleFrets.map(f => STRINGS[1].midi + f);
		} else if (selectedString === 0) {
			// G string: C4 (5), D4 (7), E4 (9), F4 (10), G4 (0), A4 (2), B4 (4), C5 (5)
			scaleFrets = [5, 7, 9, 10, 0, 2, 4, 5];
			midiNotes = scaleFrets.map(f => STRINGS[0].midi + f);
		}
		if (midiNotes.length) {
			for (let i = 0; i < midiNotes.length; i++) {
				setPlaying({ stringIdx: selectedString, fret: scaleFrets[i] });
				bassRef.current.start({ note: midiNotes[i], velocity: 100 });
				await new Promise((res) => setTimeout(res, 400));
				setPlaying(null);
			}
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
			<div style={{ marginTop: 24, marginBottom: 8 }}>
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
