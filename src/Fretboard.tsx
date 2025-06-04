import React from 'react';
import './Fretboard.css';

export interface FretboardProps {
	strings: { name: string; midi: number }[];
	fretCount: number;
	audioReady: boolean;
	selectedString: number | null;
	playing: { stringIdx: number; fret: number } | null;
	onStringClick: (stringIdx: number) => void;
	onFretClick: (stringIdx: number, fret: number) => void;
	getNoteName: (midi: number) => string;
}

export const Fretboard: React.FC<FretboardProps> = ({
	strings,
	fretCount,
	audioReady,
	selectedString,
	playing,
	onStringClick,
	onFretClick,
	getNoteName,
}) => (
	<div className="fretboard">
		<table>
			<thead>
				<tr>
					<th>String</th>
					{[...Array(fretCount + 1)].map((_, fret) => (
						<th key={fret}>{fret}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{strings.map((string, stringIdx) => (
					<tr
						key={string.name}
						className={selectedString === stringIdx ? 'selected-row' : ''}
					>
						<td
							className={selectedString === stringIdx ? 'selected-fret' : ''}
							style={{ cursor: 'pointer' }}
							onClick={() => onStringClick(stringIdx)}
						>
							{string.name}
						</td>
						{[...Array(fretCount + 1)].map((_, fret) => {
							const midi = string.midi + fret;
							const note = getNoteName(midi);
							const playingCell = !!playing && playing.stringIdx === stringIdx && playing.fret === fret;
							return (
								<td
									key={fret}
									className={playingCell ? 'playing-fret' : 'fret'}
									onClick={() => onFretClick(stringIdx, fret)}
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
	</div>
);
