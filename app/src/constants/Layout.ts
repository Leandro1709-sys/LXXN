import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const PAD_SIZE = width * 0.85; 
export const DOT_SIZE = 50;
export const RADIUS = DOT_SIZE / 2;
export const MIN_POS = RADIUS;
export const MAX_POS = PAD_SIZE - RADIUS;
export const LED_GRID_SIZE = 8; 
export const LED_CELL_SIZE = PAD_SIZE / LED_GRID_SIZE;

// Colores del Sistema (Para tenerlos centralizados)
export const COLORS = {
    BACKGROUND: '#000',
    CHASSIS: '#2a2a2a',
    ACCENT: '#ff0000', // Rojo Cyberpunk
    TEXT_GLOW: '#ff3333',
    GRID: 'rgba(255, 0, 0, 0.3)',
    DARK_UI: '#111',
    LCD_BG: '#0a0a0a'
};

export { width };
