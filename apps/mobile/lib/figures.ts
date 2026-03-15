import { ImageSourcePropType } from 'react-native';

// Static require map — RN bundler requires literal require() calls
const FIGURE_ASSETS: Record<string, ImageSourcePropType> = {
  'T-1': require('../assets/images/figures/T-1.jpg'),
  'T-2': require('../assets/images/figures/T-2.jpg'),
  'T-3': require('../assets/images/figures/T-3.jpg'),
  'G7-1': require('../assets/images/figures/G7-1.png'),
  'E5-1': require('../assets/images/figures/E5-1.png'),
  'E6-1': require('../assets/images/figures/E6-1.png'),
  'E6-2': require('../assets/images/figures/E6-2.png'),
  'E6-3': require('../assets/images/figures/E6-3.png'),
  'E7-1': require('../assets/images/figures/E7-1.png'),
  'E7-2': require('../assets/images/figures/E7-2.png'),
  'E7-3': require('../assets/images/figures/E7-3.png'),
  'E9-1': require('../assets/images/figures/E9-1.png'),
  'E9-2': require('../assets/images/figures/E9-2.png'),
  'E9-3': require('../assets/images/figures/E9-3.png'),
};

/** Returns the figure name referenced in a question string, or null. */
export function parseFigureRef(questionText: string): string | null {
  const m = questionText.match(/figure\s+([A-Z0-9]+-\d+)/i);
  return m ? m[1].toUpperCase() : null;
}

/** Returns the bundled image source for a figure name, or null if unknown. */
export function getFigureSource(name: string): ImageSourcePropType | null {
  return FIGURE_ASSETS[name] ?? null;
}
