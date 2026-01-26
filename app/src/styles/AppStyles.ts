import { StyleSheet, Platform } from 'react-native';
import { 
    SCREEN_WIDTH, SCREEN_HEIGHT, PAD_SIZE, DOT_SIZE, LED_CELL_SIZE, COLORS 
} from '../constants/Layout';

export const logoStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, width: '100%', paddingHorizontal: 5 },
  lcdScreen: { width: 90, height: 44, backgroundColor: COLORS.LCD_BG, borderWidth: 2, borderColor: '#333', borderRadius: 6, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  lcdText: { color: COLORS.TEXT_GLOW, fontSize: 26, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold', letterSpacing: 2 },
  scanline: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.3)', opacity: 0.5 },
  logoWrapper: { flexDirection: 'row', alignItems: 'center' },
  brandText: { color: '#fff', fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  glitchLayer: { position: 'absolute', top: 2, left: 2, color: 'rgba(255, 0, 0, 0.7)', zIndex: -1 },
  modelText: { color: '#666', fontSize: 8, letterSpacing: 2, marginTop: -4, fontWeight: 'bold' },
  infoBtn: { 
      marginLeft: 10, 
      paddingHorizontal: 12, // Más ancho
      paddingVertical: 4, 
      borderRadius: 4, // Bordes cuadrados (tech style)
      borderWidth: 1, 
      borderColor: COLORS.ACCENT, // Borde ROJO para que llame la atención
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'rgba(255, 0, 0, 0.1)' // Fondo rojo muy sutil
  },
  infoBtnText: { 
      color: COLORS.ACCENT, // Texto Rojo
      fontWeight: 'bold', 
      fontSize: 10, // Letra pequeña y técnica
      letterSpacing: 1 
  }
});

export const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    container: { width: '90%', height: '80%', backgroundColor: '#050505', borderWidth: 2, borderColor: COLORS.ACCENT, borderRadius: 10, padding: 20 },
    title: { color: COLORS.ACCENT, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    scroll: { flex: 1 },
    scrollTrack: { width: 4, backgroundColor: '#111', borderRadius: 2, marginLeft: 2, height: '100%' },
    scrollThumb: { width: '100%', backgroundColor: COLORS.ACCENT, borderRadius: 2 },
    text: { color: '#0f0', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 18 },
    footer: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
    sectionTitle: { color: '#fff', marginBottom: 10, fontWeight: 'bold', textAlign: 'center', fontSize: 10, letterSpacing: 2 },
    linkButton: { padding: 8, borderWidth: 1, borderColor: '#ff0404ff', marginBottom: 8, alignItems: 'center', borderRadius: 4, backgroundColor: '#111' },
    linkText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    closeBtn: { marginTop: 5, padding: 12, backgroundColor: '#200', alignItems: 'center', borderWidth: 1, borderColor: COLORS.ACCENT },
    closeText: { color: COLORS.ACCENT, fontWeight: 'bold', letterSpacing: 1 }
});

export const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: COLORS.BACKGROUND, justifyContent: 'center', alignItems: 'center', width: '100%' },
  loadingText: { color: COLORS.TEXT_GLOW, fontSize: 16, marginTop: 40, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 2, fontWeight: 'bold' },
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, justifyContent: 'center', alignItems: 'center' },
  chassis: { width: SCREEN_WIDTH * 0.95, height: SCREEN_HEIGHT * 0.92, backgroundColor: COLORS.CHASSIS, borderRadius: 30, borderWidth: 6, borderColor: '#1a1a1a', padding: 15, paddingTop: 30, elevation: 20, justifyContent: 'flex-start' },
  padBezel: { backgroundColor: '#111', padding: 10, borderRadius: 15, borderWidth: 2, borderColor: '#330000', alignSelf: 'center' },
  padSurface: { width: PAD_SIZE, height: PAD_SIZE, backgroundColor: '#000', borderRadius: 5, overflow: 'hidden', borderWidth: 3, borderColor: COLORS.ACCENT },
  ledCell: { position: 'absolute', width: LED_CELL_SIZE, height: LED_CELL_SIZE, backgroundColor: COLORS.ACCENT, borderWidth: 1, borderColor: '#330000' },
  gridH: { position: 'absolute', top: '50%', width: '100%', height: 2, backgroundColor: COLORS.GRID },
  gridV: { position: 'absolute', left: '50%', height: '100%', width: 2, backgroundColor: COLORS.GRID },
  controlsContainer: { marginTop: 10, width: '100%' },
  sectionLabel: { color: '#ec0909ff', fontSize: 10, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, marginBottom: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  btnWrapper: { width: '30%', alignItems: 'center' },
  slotBtn: { width: '100%', height: 45, backgroundColor: '#333', borderRadius: 6, borderWidth: 2, borderColor: '#111', justifyContent: 'center', alignItems: 'center' },
  btnLabel: { fontSize: 11, fontWeight: '900' },
  recordingDot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: '#f00' },
  cursorBox: { position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, borderWidth: 2, borderRadius: 4, justifyContent: 'center', alignItems: 'center', shadowColor: '#f00', shadowOpacity: 0.8, shadowRadius: 10, elevation: 10, zIndex: 100 },
  cursorLineV: { position: 'absolute', width: 4, height: '60%', borderRadius: 2 },
  cursorLineH: { position: 'absolute', height: 4, width: '60%', borderRadius: 2 },
  faderContainer: { width: '100%', alignItems: 'center', marginTop: 10, marginBottom: 5 },
  faderLabel: { 
    color: COLORS.ACCENT, 
    fontSize: 10, 
    fontWeight: 'bold', 
    letterSpacing: 2, 
    marginBottom: 2, 
    marginTop: 4,
    
    // --- CAMBIOS PARA CENTRAR ---
    width: '100%',          // Ocupa todo el ancho disponible
    textAlign: 'center',    // Centra el texto
    // alignSelf: 'flex-start', <--- BORRAR ESTO (o comentar)
    // marginLeft: 10,          <--- BORRAR ESTO (o comentar)
  },
  faderTrack: { width: '100%', height: 25, backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 4, overflow: 'hidden', justifyContent: 'center' },
  faderLevel: { height: '100%', backgroundColor: COLORS.ACCENT, opacity: 0.8 }
});