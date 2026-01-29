import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, StatusBar, Dimensions
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, useSharedValue, withSpring, runOnJS, interpolateColor 
} from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as SplashScreen from 'expo-splash-screen';

// IMPORTS
import { 
  PAD_SIZE, DOT_SIZE, MIN_POS, MAX_POS, width 
} from './src/constants/Layout';
import { styles } from './src/styles/AppStyles';
import { ManualModal } from './src/components/ManualModal';
import { LxxnLoadingScreen } from './src/components/LxxnLoadingScreen';
import { LedCell } from './src/components/LedCell'; 
import { OpticalTheremin } from './src/components/OpticalTheremin';

SplashScreen.preventAutoHideAsync();

// --- CONFIGURACIÓN DE SLOTS ---
const SLOTS_CONFIG = [
  { id: 's1', label: 'CICCIO', type: 'inst', baseVolume: 1.0, file: require('../assets/sounds/instrumentos/ciccio2.mp3') }, 
  { id: 's2', label: 'BRASS',  type: 'inst', baseVolume: 1.0, file: require('../assets/sounds/instrumentos/brass.mp3') },
  { id: 's3', label: 'DIST',    type: 'inst', baseVolume: 1.0, file: require('../assets/sounds/instrumentos/disto.mp3') },
  { id: 'b1', label: 'TREM',    type: 'base', baseVolume: 1.0, file: require('../assets/sounds/instrumentos/tremolo.mp3') },
  { id: 'b2', label: 'BOX', type: 'base', baseVolume: 1.0, file: require('../assets/sounds/bases/electrobox.mp3') },
  { id: 'b3', label: 'STUFF', type: 'base', baseVolume: 1.0, file: require('../assets/sounds/instrumentos/stuff.mp3') },
  { id: 'u1', label: 'USER',   type: 'user', baseVolume: 1.0, file: null }, 
  { id: 'r1', label: 'MIC',    type: 'rec',  baseVolume: 1.0, file: null },
];

type SlotState = 'EMPTY' | 'RECORDING' | 'IDLE' | 'ACTIVE' | 'HOLD'; 

function KaossPad() {
  const [status, setStatus] = useState('RDY');
  const [modalVisible, setModalVisible] = useState(false);
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>({ u1: 'EMPTY', r1: 'EMPTY' });
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [slotVolumes, setSlotVolumes] = useState<Record<string, number>>({
      s1: 1.0, s2: 1.0, s3: 1.0, b1: 1.0, b2: 1.0, b3: 1.0, u1: 1.0, r1: 1.0
  });

  // --- ESTADOS V2 (THEREMIN) ---
  const [opticalActive, setOpticalActive] = useState(false);
  const [visualLux, setVisualLux] = useState(0);

  const lastTapRef = useRef<Record<string, number>>({});
  const soundPool = useRef<Record<string, Audio.Sound>>({});
  const recordingRef = useRef<Audio.Recording | null>(null);

  const posX = useSharedValue(PAD_SIZE / 2);
  const posY = useSharedValue(PAD_SIZE / 2);
  const isPressed = useSharedValue(false);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true, shouldDuckAndroid: true });
    })();
    const preloadSounds = async () => {
      const newPool: Record<string, Audio.Sound> = {};
      for (const slot of SLOTS_CONFIG) {
        if (!slot.file) continue;
        try {
          const { sound } = await Audio.Sound.createAsync(slot.file, { shouldPlay: false, isLooping: true, volume: slot.baseVolume });
          newPool[slot.id] = sound;
          setSlotStates(prev => ({ ...prev, [slot.id]: 'IDLE' }));
        } catch (e) { console.log(`Err ${slot.id}`, e); }
      }
      soundPool.current = newPool;
    };
    preloadSounds();
    return () => { Object.values(soundPool.current).forEach(s => s.unloadAsync()); };
  }, []);

  // --- LÓGICA DE COLOR DEL PAD ---
  const getPadColor = () => {
    if (!activeSlotId) return '#333333'; // GRIS OSCURO (Idle)
    
    const state = slotStates[activeSlotId];
    if (state === 'ACTIVE') return '#00e5ff'; // CIAN (Seleccionado/Sonando)
    if (state === 'HOLD') return '#ff0000';   // ROJO (Loop Lock)
    if (state === 'RECORDING') return '#ff0000'; // ROJO (Grabando)
    
    return '#333333';
  };
  const currentPadColor = getPadColor();

  // --- LOGICA AUDIO ---
  const loadUserFile = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets[0]) {
            setStatus('LOA');
            if (soundPool.current['u1']) await soundPool.current['u1'].unloadAsync();
            const { sound } = await Audio.Sound.createAsync({ uri: result.assets[0].uri }, { shouldPlay: false, isLooping: true, volume: 1.0 });
            soundPool.current['u1'] = sound;
            setSlotStates(prev => ({ ...prev, u1: 'IDLE' })); 
            setStatus('USER');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    } catch (e) { setStatus('ERR'); }
  };

  const resetUserSlot = async () => {
      if (soundPool.current['u1']) { await soundPool.current['u1'].stopAsync(); await soundPool.current['u1'].unloadAsync(); }
      setSlotStates(prev => ({ ...prev, u1: 'EMPTY' }));
      if (activeSlotId === 'u1') setActiveSlotId(null);
      setStatus('CLR');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true }); 
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setSlotStates(prev => ({ ...prev, r1: 'RECORDING' }));
      setStatus('REC');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (err) { setStatus('ERR'); }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      setStatus('SAV');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI(); 
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (uri) {
        if (soundPool.current['r1']) await soundPool.current['r1'].unloadAsync();
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false, isLooping: true, volume: 1.0 });
        soundPool.current['r1'] = sound;
        setSlotStates(prev => ({ ...prev, r1: 'IDLE' })); 
        setStatus('MIC'); 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) { setStatus('ERR'); }
  };

  const resetRecording = async () => {
     if (soundPool.current['r1']) await soundPool.current['r1'].unloadAsync();
     setSlotStates(prev => ({ ...prev, r1: 'EMPTY' }));
     setStatus('CLR');
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleBlackout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setStatus('KLL');
    setActiveSlotId(null);
    for (const key in soundPool.current) {
        try {
            await soundPool.current[key].stopAsync();
            const config = SLOTS_CONFIG.find(s => s.id === key) || { baseVolume: 1.0 };
            const currentVol = slotVolumes[key] ?? 1.0;
            await soundPool.current[key].setStatusAsync({ rate: 1.0, volume: config.baseVolume * currentVol, shouldCorrectPitch: false });
        } catch (e) {}
    }
    setSlotStates(prev => {
        const newState = { ...prev };
        for (const key in newState) { if (newState[key] === 'ACTIVE' || newState[key] === 'HOLD') newState[key] = 'IDLE'; }
        return newState;
    });
  };

  const handleVolumeChange = async (val: number) => {
    if (!activeSlotId) return;
    setSlotVolumes(prev => ({ ...prev, [activeSlotId]: val }));
    const sound = soundPool.current[activeSlotId];
    if (sound) {
        const config = SLOTS_CONFIG.find(s => s.id === activeSlotId);
        const baseVol = config ? config.baseVolume : 1.0;
        try { await sound.setVolumeAsync(val * baseVol); } catch (e) {}
    }
  };

  // --- LOGICA THEREMIN ---
  const handleLightUpdate = async (value: number) => {
    setVisualLux(value);
    if (!activeSlotId) return;
    const soundObject = soundPool.current[activeSlotId];
    if (soundObject) {
      try {
        const pitch = 0.1 + (value * 1.9); 
        await soundObject.setRateAsync(pitch, false);
      } catch (error) {}
    }
  };

  const handleSlotPress = async (slotId: string) => {
    const currentState = slotStates[slotId];
    
    // Config para Label
    const config = SLOTS_CONFIG.find(s => s.id === slotId);
    const labelToShow = config ? config.label : slotId.toUpperCase();

    if (slotId === 'r1') {
        if (currentState === 'EMPTY') { startRecording(); return; }
        if (currentState === 'RECORDING') { stopRecording(); return; }
    }
    if (slotId === 'u1' && currentState === 'EMPTY') { loadUserFile(); return; }

    const now = Date.now();
    const lastTime = lastTapRef.current[slotId] || 0;
    const timeDiff = now - lastTime;
    lastTapRef.current[slotId] = now;
    
    const sound = soundPool.current[slotId];
    if (!sound) return;
    const currentVol = slotVolumes[slotId] ?? 1.0;
    const baseVol = config ? config.baseVolume : 1.0;

    if (timeDiff < 300) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (currentState === 'HOLD') {
        await sound.stopAsync();
        await sound.setStatusAsync({ rate: 1.0, volume: baseVol * currentVol, shouldCorrectPitch: false });
        setSlotStates(prev => ({ ...prev, [slotId]: 'IDLE' }));
        if (activeSlotId === slotId) setActiveSlotId(null);
        setStatus('STP');
      } else {
        await sound.setIsLoopingAsync(true);
        const status = await sound.getStatusAsync();
        if (!status.isLoaded || !status.isPlaying) await sound.playAsync();
        setSlotStates(prev => ({ ...prev, [slotId]: 'HOLD' }));
        setActiveSlotId(slotId); 
        setStatus('LCK');
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setActiveSlotId(slotId);
      setSlotStates(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(k => { if (newState[k] === 'ACTIVE') newState[k] = 'IDLE'; });
        if (newState[slotId] !== 'HOLD') newState[slotId] = 'ACTIVE';
        return newState;
      });
      // Muestra el nombre en el display
      setStatus(labelToShow);
    }
  };

const updateAudio = async (x: number, y: number) => {
    if (!activeSlotId) return;
    const sound = soundPool.current[activeSlotId];
    if (!sound) return;
    
    const config = SLOTS_CONFIG.find(s => s.id === activeSlotId) || { baseVolume: 1.0 };
    
    // Calculamos distancias y porcentajes (0.0 a 1.0)
    const travelDistance = PAD_SIZE - DOT_SIZE;
    const clampedX = Math.max(MIN_POS, Math.min(x, MAX_POS));
    const clampedY = Math.max(MIN_POS, Math.min(y, MAX_POS));
    
    const percentX = (clampedX - MIN_POS) / travelDistance; 
    const percentY = (clampedY - MIN_POS) / travelDistance; 
    
    // --- CORRECCIÓN MATEMÁTICA ---
    
    // 1. FACTOR X (Velocidad Base):
    // Queremos que en el CENTRO (0.5) el valor sea 1.0
    // Fórmula: 0.5 + percentX
    // Izquierda (0.0) -> 0.5 (Mitad de velocidad)
    // Centro (0.5)    -> 1.0 (Original)
    // Derecha (1.0)   -> 1.5 (Acelerado)
    const octaveFactor = 0.5 + percentX; 

    // 2. FACTOR Y (Bend/Desafinación Sutil):
    // Queremos que en el CENTRO (0.5) el efecto sea 0
    // Arriba (0.0) -> +0.1
    // Centro (0.5) -> 0.0
    // Abajo (1.0)  -> -0.1
    const bendFactor = 0.1 - (percentY * 0.2);   
    
    // Sumamos: 1.0 (Base) + 0.0 (Bend) = 1.0 (Perfecto Original)
    const finalRate = Math.max(0.1, Math.min(3.0, octaveFactor + bendFactor));
    
    const currentVol = slotVolumes[activeSlotId] ?? 1.0;
    
    try { 
        await sound.setStatusAsync({ 
            rate: finalRate, 
            volume: config.baseVolume * currentVol, 
            shouldCorrectPitch: false 
        }); 
    } catch (e) {}
  }; 

  const onStart = (x: number, y: number) => {
    isPressed.value = true;
    const safeX = Math.max(MIN_POS, Math.min(x, MAX_POS));
    const safeY = Math.max(MIN_POS, Math.min(y, MAX_POS));
    posX.value = safeX; posY.value = safeY;
    if (activeSlotId) {
       const sound = soundPool.current[activeSlotId];
       if (sound) sound.playAsync();
       runOnJS(updateAudio)(safeX, safeY);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };
  const onMove = (x: number, y: number) => {
    if (!isPressed.value) return;
    const safeX = Math.max(MIN_POS, Math.min(x, MAX_POS));
    const safeY = Math.max(MIN_POS, Math.min(y, MAX_POS));
    posX.value = safeX; posY.value = safeY;
    runOnJS(updateAudio)(safeX, safeY);
  };
  const onEnd = () => {
    isPressed.value = false;
    if (activeSlotId) {
        const state = slotStates[activeSlotId];
        const sound = soundPool.current[activeSlotId];
        if (state !== 'HOLD' && sound) sound.pauseAsync();
    }
  };

  const gesture = Gesture.Pan().onBegin((e) => runOnJS(onStart)(e.x, e.y)).onUpdate((e) => runOnJS(onMove)(e.x, e.y)).onFinalize(() => runOnJS(onEnd)());

  const cursorContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(isPressed.value ? 1 : 0, [0, 1], ['#000000', '#ff0000']);
    const borderColor = interpolateColor(isPressed.value ? 1 : 0, [0, 1], ['#ff0000', '#330000']);
    return {
      transform: [{ translateX: posX.value - DOT_SIZE / 2 }, { translateY: posY.value - DOT_SIZE / 2 }, { scale: withSpring(isPressed.value ? 1.1 : 1) }, { rotate: withSpring(isPressed.value ? '45deg' : '0deg') }],
      backgroundColor: backgroundColor, borderColor: borderColor,
    };
  });
  const cursorCrossStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(isPressed.value ? 1 : 0, [0, 1], ['#ff0000', '#000000']);
    return { backgroundColor };
  });

  const faderWidth = width * 0.85; 
  const onFaderTouch = (e: any) => {
      if (!activeSlotId) return;
      const touchX = e.nativeEvent.locationX;
      const cleanVol = Math.max(0, Math.min(1, touchX / faderWidth));
      handleVolumeChange(cleanVol);
  };

  const renderSlotButton = (slot: typeof SLOTS_CONFIG[0]) => {
    const state = slotStates[slot.id] || (slot.id === 'u1' || slot.id === 'r1' ? 'EMPTY' : 'IDLE');
    let btnColor = '#222'; let borderColor = '#333'; let textColor = '#555'; let label = slot.label;
    if (state === 'RECORDING') { btnColor = '#500'; borderColor = '#f00'; textColor = '#fff'; label = "● REC"; } 
    else if (state === 'ACTIVE') { btnColor = '#003344'; borderColor = '#00e5ff'; textColor = '#00e5ff'; } 
    else if (state === 'HOLD') { btnColor = '#440000'; borderColor = '#ff0000'; textColor = '#ff0000'; } 
    else if (state === 'EMPTY') { btnColor = '#111'; borderColor = '#6e0303ff'; textColor = '#e70606ff'; label = slot.id === 'r1' ? "MIC/REC" : "LOAD +"; } 
    else if (state === 'IDLE') { btnColor = '#333'; borderColor = '#444'; textColor = '#888'; if (slot.id === 'r1') label = "MIC 1"; }

    return (
      <View key={slot.id} style={styles.btnWrapper}>
        <TouchableOpacity 
          style={[styles.slotBtn, { backgroundColor: btnColor, borderColor: borderColor }]}
          onPress={() => handleSlotPress(slot.id)}
          onLongPress={() => {
              if (slot.id === 'u1' && state !== 'EMPTY') resetUserSlot();
              if (slot.id === 'r1' && state !== 'RECORDING' && state !== 'EMPTY') resetRecording();
          }}
        >
          {state === 'HOLD' && <View style={styles.recordingDot} />} 
          {state === 'RECORDING' && <View style={[styles.recordingDot, {backgroundColor: '#fff'}]} />} 
          <Text style={[styles.btnLabel, { color: textColor }]}>{label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
       <View style={styles.chassis}>
          
          {/* ========================================================== */}
          {/* HEADER ALINEADO (GRID 4 ELEMENTOS)                         */}
          {/* ========================================================== */}
          <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', // Distribuye equitativamente
              alignItems: 'center', 
              width: '100%',
              paddingHorizontal: 15, // Un poco menos de borde para ganar espacio central
              paddingTop: 20,        // Más aire arriba
              paddingBottom: 10
          }}>
              
              {/* 1. SECTOR DISPLAY (Ancho fijo 60) */}
              <View style={[styles.btnWrapper, { width: 60, height: 36 }]}>
                  <View style={[styles.slotBtn, { 
                      backgroundColor: '#111', 
                      borderColor: '#444',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%' // Asegura que llene el wrapper
                  }]}>
                      <Text style={{ color: '#f00', fontSize: 10, fontWeight: 'bold' }}>
                          {status}
                      </Text>
                  </View>
              </View>

              {/* 2. SECTOR TEREMÍN (Botón estilizado igual que los otros) */}
              <TouchableOpacity 
                  onPress={() => setOpticalActive(!opticalActive)}
                  style={{
                      height: 36, // Altura idéntica a los otros
                      flexDirection: 'row', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: opticalActive ? '#ff0000' : '#444', // Borde activo/inactivo
                      backgroundColor: opticalActive ? 'rgba(255,0,0,0.2)' : '#111',
                      borderRadius: 4,
                      paddingHorizontal: 10,
                      minWidth: 90 // Un poco más ancho para que quepa el texto
                  }}
              >
                  <View style={{
                      width: 6, height: 6, borderRadius: 3, 
                      backgroundColor: opticalActive ? '#ff0000' : '#333',
                      marginRight: 8
                  }}/>
                  <Text style={{ 
                      color: opticalActive ? '#ff0000' : '#666', 
                      fontSize: 10, fontWeight: 'bold', letterSpacing: 1 
                  }}>
                      TEREMÍN
                  </Text>
              </TouchableOpacity>

              {/* 3. SECTOR LOGO (Verticalmente centrado) */}
              <View style={{ 
                  backgroundColor: '#fff', 
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 2,
                  height: 36, // Misma altura visual
                  minWidth: 50
              }}>
                  <Text style={{ 
                      color: '#f00', fontSize: 18, fontWeight: '900', letterSpacing: 1, lineHeight: 18, includeFontPadding: false
                  }}>
                      LXXN
                  </Text>
                  <Text style={{ 
                      color: '#000', fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5, marginTop: 0
                  }}>
                      v 2.0
                  </Text>
              </View>

              {/* 4. SECTOR +INFO (Ancho fijo 60) */}
              <View style={[styles.btnWrapper, { width: 60, height: 36 }]}>
                  <TouchableOpacity 
                      onPress={() => setModalVisible(true)}
                      style={[styles.slotBtn, { 
                          backgroundColor: '#111', 
                          borderColor: '#555',     
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%'
                      }]}
                  >
                      <Text style={[styles.btnLabel, { color: '#ccc', fontSize: 10 }]}>+INFO</Text>
                  </TouchableOpacity>
              </View>

          </View>

          {/* ========================================================== */}
          {/* BARRA DE LUMEN + ESPACIADOR (Separa el Header del Pad)     */}
          {/* ========================================================== */}
          <View style={{ 
              width: '100%', 
              height: 20, // Altura fija: Reserva espacio aunque esté apagado
              justifyContent: 'center',
              paddingHorizontal: 20,
              marginBottom: 10, // Margen extra para separar del PAD
              marginTop: 5
          }}>
            {opticalActive ? (
              <View style={{ width: '100%', height: 4, backgroundColor: '#100', borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ width: `${visualLux * 100}%`, height: '100%', backgroundColor: '#f00', opacity: 0.8 }} />
              </View>
            ) : (
               /* Línea decorativa muy sutil cuando está apagado para mantener estructura */
               <View style={{ width: '100%', height: 1, backgroundColor: '#222' }} />
            )}
          </View>

          {/* 3. ZONA PRINCIPAL (PAD CENTRADO) - SIN CAMBIOS */}
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', height: PAD_SIZE }}>
            <View style={styles.padBezel}>
                <GestureDetector gesture={gesture}>
                <View style={[styles.padSurface, { flexDirection: 'row', flexWrap: 'wrap' }]}>  
                    
                    {Array.from({length:64}).map((_,i)=>(
                        <LedCell 
                            key={i} 
                            row={Math.floor(i/8)} 
                            col={i%8} 
                            color={currentPadColor} 
                        />
                    ))}
                    
                    <View style={styles.gridH} /><View style={styles.gridV} />
                    
                    <Animated.View style={[styles.cursorBox, cursorContainerStyle]}>
                        <Animated.View style={[styles.cursorLineV, cursorCrossStyle]} />
                        <Animated.View style={[styles.cursorLineH, cursorCrossStyle]} />
                    </Animated.View>
                </View>
                </GestureDetector>
            </View>
          </View>
          
          {/* CONTROLES INFERIORES - SIN CAMBIOS */}
          <View style={styles.faderContainer}>
             <Text style={styles.faderLabel}>
                {activeSlotId 
                  ? `${SLOTS_CONFIG.find(s => s.id === activeSlotId)?.label} VOL` 
                  : "SELECT CH"
                }
             </Text>
             <View style={styles.faderTrack} onTouchStart={onFaderTouch} onTouchMove={onFaderTouch}>
                <View style={[styles.faderLevel, { width: activeSlotId ? `${(slotVolumes[activeSlotId] || 0) * 100}%` : '0%', backgroundColor: activeSlotId ? '#ff0000' : '#333' }]} />
             </View>
          </View>

          <View style={styles.controlsContainer}>
            <Text style={styles.sectionLabel}>-------- INSTRUMENTS --------</Text>
            <View style={styles.buttonRow}>{SLOTS_CONFIG.filter(s => s.type === 'inst').map(renderSlotButton)}</View>
            <Text style={[styles.sectionLabel, { marginTop: 4 }]}>---- INST --------------- BASE --------------- INST ----</Text>
            <View style={styles.buttonRow}>{SLOTS_CONFIG.filter(s => s.type === 'base').map(renderSlotButton)}</View>
            <Text style={[styles.sectionLabel, { marginTop: 4 }]}>-------- LIVE CONTROL --------</Text>
            <View style={[styles.buttonRow, { marginTop: 4, justifyContent: 'space-between' }]}>
                {renderSlotButton(SLOTS_CONFIG.find(s => s.id === 'u1')!)}
                <View style={styles.btnWrapper}>
                    <TouchableOpacity style={[styles.slotBtn, { backgroundColor: '#300', borderColor: '#f00' }]} onPress={handleBlackout}>
                        <Text style={[styles.btnLabel, { color: '#f00', fontSize: 10 }]}>KILL ALL</Text>
                    </TouchableOpacity>
                </View>
                {renderSlotButton(SLOTS_CONFIG.find(s => s.id === 'r1')!)}
            </View>
          </View>
        </View>
        
        <ManualModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        <View style={{ height: 1, width: 1, opacity: 0, overflow: 'hidden' }}>
             <OpticalTheremin active={opticalActive} onClose={() => setOpticalActive(false)} onLightUpdate={handleLightUpdate} />
        </View>

      </View>
    </GestureHandlerRootView>
  );
}

export default function AppWrapper() {
  const [appReady, setAppReady] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const onLayoutRootView = useCallback(async () => { if (isLayoutReady) await SplashScreen.hideAsync(); }, [isLayoutReady]);
  useEffect(() => { setTimeout(() => setIsLayoutReady(true), 100); }, []);
  if (!appReady) return <LxxnLoadingScreen onFinish={() => setAppReady(true)} />;
  return <KaossPad />;
}