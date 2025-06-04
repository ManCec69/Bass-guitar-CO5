import { useEffect, useRef, useState } from 'react';
import { Soundfont } from 'smplr';
import './App.css';
import { Fretboard } from './Fretboard';
import { Controls } from './Controls';

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
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];
const NOTE_TO_SEMITONE: Record<string, number> = {
	'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'Fb': 4, 'G': 7, 'G#/Ab': 8, 'A': 9, 'A#': 10, 'B': 11
};
const SCALE_TYPES = [
	{ label: 'Major', value: 'major' },
	{ label: 'Minor', value: 'minor' },
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
	};

	const handleStringClick = (stringIdx: number) => {
		setSelectedString((prev) => (prev === stringIdx ? null : stringIdx));
	};

	const playScale = async () => {
		if (!audioReady || !bassRef.current || !audioCtxRef.current) return;
		if (selectedString === null) return;
		await audioCtxRef.current.resume();
		const openMidi = STRINGS[selectedString].midi;
		const keyOffset = NOTE_TO_SEMITONE[selectedKey] ?? 0;
		let rootFret = 0;
		while (((openMidi + rootFret) % 12) !== keyOffset && rootFret <= FRET_COUNT) {
			rootFret++;
		}
		const scaleIntervals = selectedScale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
		const scaleFrets = scaleIntervals.map((interval) => rootFret + interval);
		const midiNotes = scaleFrets.map((fret) => openMidi + fret);
		for (let i = 0; i < midiNotes.length; i++) {
			setPlaying({ stringIdx: selectedString, fret: scaleFrets[i] });
			bassRef.current.start({ note: midiNotes[i], velocity: 100 });
			await new Promise((res) => setTimeout(res, 400));
			setPlaying(null);
		}
	};

	return (
		<div className="fretboard-container">
			<h1>5-String Bass Guitar Fretboard</h1>
			<Fretboard
				strings={STRINGS}
				fretCount={FRET_COUNT}
				audioReady={audioReady}
				selectedString={selectedString}
				playing={playing}
				onStringClick={handleStringClick}
				onFretClick={handleFretClick}
				getNoteName={getNoteName}
			/>
			{!audioReady && <div className="loading">Loading bass samples...</div>}
			<Controls
				keys={KEYS}
				scaleTypes={SCALE_TYPES}
				selectedKey={selectedKey}
				selectedScale={selectedScale}
				onKeyChange={setSelectedKey}
				onScaleChange={setSelectedScale}
				onPlayScale={playScale}
				playDisabled={selectedString === null}
			/>
		</div>
	);
}
