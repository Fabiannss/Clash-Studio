import type { Config } from 'tailwindcss';

// Cores com significado: A/B identificam os lutadores; act1..act3 formam a
// rampa de intensidade dos três takes (tensão -> trocação -> clímax).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#12141A',
        // Mesmo tom de "base", usado como cor de texto: "text-base" é tamanho de fonte no Tailwind.
        canvas: '#12141A',
        surface: '#191C24',
        raised: '#212530',
        line: '#2C3240',
        ink: '#E7E9EF',
        mute: '#8C94A6',
        playhead: '#FFC247',
        fighterA: '#FF7A59',
        fighterB: '#3FC1D9',
        act1: '#8A93A6',
        act2: '#E8A93A',
        act3: '#E5483B',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
