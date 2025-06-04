import React from 'react';

export interface ControlsProps {
	keys: string[];
	scaleTypes: { label: string; value: string }[];
	selectedKey: string;
	selectedScale: string;
	onKeyChange: (key: string) => void;
	onScaleChange: (scale: string) => void;
	onPlayScale: () => void;
	playDisabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
	keys,
	scaleTypes,
	selectedKey,
	selectedScale,
	onKeyChange,
	onScaleChange,
	onPlayScale,
	playDisabled,
}) => (
	<div style={{ marginTop: 24, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
		<label htmlFor="key-select" style={{ marginRight: 8 }}>Key:</label>
		<select
			id="key-select"
			value={selectedKey}
			onChange={e => onKeyChange(e.target.value)}
			style={{ fontSize: '1em', padding: '0.2em 0.5em' }}
		>
			{keys.map(key => (
				<option key={key} value={key}>{key}</option>
			))}
		</select>
		<label htmlFor="scale-select" style={{ marginLeft: 8, marginRight: 8 }}>Scale:</label>
		<select
			id="scale-select"
			value={selectedScale}
			onChange={e => onScaleChange(e.target.value)}
			style={{ fontSize: '1em', padding: '0.2em 0.5em' }}
		>
			{scaleTypes.map(scale => (
				<option key={scale.value} value={scale.value}>{scale.label}</option>
			))}
		</select>
		<button
			style={{ marginTop: 0 }}
			onClick={onPlayScale}
			disabled={playDisabled}
		>
			Play Scale
		</button>
	</div>
);
