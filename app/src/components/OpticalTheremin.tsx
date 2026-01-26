import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { LightSensor } from 'expo-sensors';

const { width } = Dimensions.get('window');

interface OpticalThereminProps {
  active: boolean;
  onClose: () => void;
  onLightUpdate: (value: number) => void;
}

export const OpticalTheremin = ({ active, onClose, onLightUpdate }: OpticalThereminProps) => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [displayLux, setDisplayLux] = useState(0); 
  
  // Referencia para el valor suavizado anterior (evita re-renders innecesarios en la lógica)
  const smoothedLuxRef = useRef(0); 

  useEffect(() => {
    if (active) {
      // 1. Velocidad máxima del sensor (aprox 30-50ms en Android/iOS)
      LightSensor.setUpdateInterval(30); 

      const subscription = LightSensor.addListener(data => {
        const rawLux = data.illuminance;

        // --- 2. FILTRO PASA BAJOS (SUAVIZADO) ---
        // alpha bajo = muy suave (tipo pad). alpha alto = rápido (tipo lead).
        // 0.08 es muy "cremoso" para evitar saltos de nota.
        const alpha = 0.29; 
        
        // Algoritmo de suavizado: Valor = (ValorActual * alpha) + (ValorAnterior * (1 - alpha))
        smoothedLuxRef.current = (rawLux * alpha) + (smoothedLuxRef.current * (1 - alpha));
        
        const smoothVal = smoothedLuxRef.current;
        setDisplayLux(Math.round(smoothVal)); // UI Feedback

        // --- 3. NORMALIZACIÓN LOGARÍTMICA (LA SOLUCIÓN AL CORTE) ---
        // El ojo y el oído no son lineales.
        // Transformamos el valor de luz a una escala logarítmica para que el control
        // se sienta natural tanto en sombra (bajos) como en luz fuerte (altos).
        
        const minLux = 0;
        const maxLux = 5000; // Subimos el techo para aguantar linternas/sol

        // Math.log(x + 1) evita log(0) que es infinito negativo.
        const logVal = Math.log(smoothVal + 1);
        const logMax = Math.log(maxLux + 1);
        
        let normalized = logVal / logMax;

        // Limpiamos los bordes (Clamp)
        normalized = Math.min(Math.max(normalized, 0), 1);
        
        // Enviamos el valor normalizado (0.0 a 1.0) al index
        onLightUpdate(normalized);
      });

      return () => subscription.remove();
    }
  }, [active]);

  if (!active) return null;
  if (!permission || !permission.granted) return <View />;

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={CameraType.front} ratio="16:9">
        <View style={styles.overlay}>
            
            <View>
                <Text style={styles.hudText}>[ OPTICAL SENSOR V2 ]</Text>
                <Text style={styles.subHud}>LOGARITHMIC SCALE</Text>
                
                {/* Mostramos el valor suavizado */}
                <Text style={styles.bigData}>{displayLux}</Text> 
                <Text style={styles.unitText}>LUMENS</Text>
            </View>

            <View style={styles.lightBarContainer}>
                {/* Barra visual Logarítmica */}
                <View style={[styles.lightBarFill, { 
                    height: `${Math.min((Math.log(displayLux+1) / Math.log(5001)) * 100, 100)}%` 
                }]} />
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>CLOSE SENSOR</Text>
            </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 999, // Asegura que tape todo si está visible (aunque en index lo ocultamos con opacity)
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60
  },
  hudText: {
    color: '#ff0000', 
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center'
  },
  subHud: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20
  },
  bigData: {
    color: '#ff0000',
    fontSize: 60,
    fontWeight: '900', // Extra Bold
    textAlign: 'center',
    textShadowColor: 'rgba(255, 0, 0, 0.6)',
    textShadowRadius: 15
  },
  unitText: {
    color: '#ff0000',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7
  },
  lightBarContainer: {
    position: 'absolute',
    right: 20,
    top: 100,
    bottom: 100,
    width: 14,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: '#111',
    justifyContent: 'flex-end'
  },
  lightBarFill: {
    backgroundColor: '#ff0000',
    width: '100%',
    opacity: 0.8,
    borderRadius: 1
  },
  closeBtn: {
    alignSelf: 'center',
    marginBottom: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ff0000',
    backgroundColor: 'rgba(50, 0, 0, 0.5)',
    borderRadius: 4
  },
  closeText: {
    color: '#ff0000',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1
  }
});