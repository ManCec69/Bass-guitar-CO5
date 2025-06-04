# Bass Guitar Fretboard Demo

This project demonstrates a 5-string bass guitar fretboard in React + TypeScript (Vite). You can visualize the fretboard, select a string, choose a key and scale, and play/hear the scale using realistic bass samples.

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm (v9 or newer recommended)

#### Node and NPM on Windows

	1.	Open PowerShell and run:
		```echo $env:PATH```
	2.	Look for the Node.js path, e.g., ⁠`C:\Program Files\nodejs\.`	
	3.	If missing, add it:
		- Search "Environment Variables" in Windows search.	
		- Open "Edit the system environment variables".
		- Click "Environment Variables".	
		- Under "System variables", select "Path" > `Edit` > `New`.	
		- Add the Node.js installation path, e.g., `⁠C:\Program Files\nodejs\.`
		- Click OK and restart terminal.

### Installation

1. Clone this repository or download the source code.
2. Install dependencies:

```sh
npm install
```

### Running the App

Start the development server:

```sh
npm run dev
```

Then open your browser to the local address shown in the terminal (usually http://localhost:5173/).

### Features
- Interactive 5-string bass fretboard (B, E, A, D, G)
- 0th to 13th fret for each string
- Click any fret to play the note
- Select a string to highlight and enable scale playback
- Choose key and scale (major/minor) from dropdowns
- Play the scale for the selected string/key/scale, with real-time note highlighting

### Project Structure
- `src/App.tsx` – Main app logic and state
- `src/Fretboard.tsx` – Fretboard table component
- `src/Controls.tsx` – Key/scale controls and play button
- `src/Fretboard.css` – Fretboard and table styles

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
