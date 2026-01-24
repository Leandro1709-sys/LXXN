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
  const [displayLux, setDisplayLux] = useState(0); // Solo para mostrar en pantalla
  
  // USAMOS REFS PARA VALORES QUE CAMBIAN MUY RÁPIDO (PERFORMANCE)
  const currentLuxRef = useRef(0); 

  useEffect(() => {
    if (active) {
      // 1. Aumentamos la velocidad de lectura del sensor para tener más datos
      LightSensor.setUpdateInterval(50); // 50ms = 20 veces por segundo

      const subscription = LightSensor.addListener(data => {
        const rawLux = data.illuminance;
        
        // --- AQUÍ ESTÁ LA MAGIA DEL SUAVIZADO (Low Pass Filter) ---
        
        // Factor de suavizado (0.05 = Muy lento/Suave, 0.5 = Rápido/Nervioso)
        // Con 0.1 logramos que el valor tarde un poco en llegar, eliminando saltos bruscos.
        const alpha = 0.1; 
        
        // Fórmula: ValorNuevo = ValorAnterior + (Diferencia * alpha)
        currentLuxRef.current = currentLuxRef.current + (rawLux - currentLuxRef.current) * alpha;
        
        const smoothedLux = currentLuxRef.current;
        setDisplayLux(Math.round(smoothedLux)); // Actualizamos UI

        // --- NORMALIZACIÓN LOGARÍTMICA (Para controlar los 3000 lux) ---
        // Usamos logaritmo para que 30 lux y 300 lux se sientan musicales.
        // Math.log(10) ~= 2.3  |  Math.log(3000) ~= 8.0
        // Mapeamos un rango útil de 0 a 2000 lux aprox.
        
        let normalized = smoothedLux / 1500; // Dividimos por 1500 en vez de 500 para aguantar la ventana
        
        // Clampeamos (Cortamos) para que nunca pase de 1.0 ni baje de 0.0
        normalized = Math.min(Math.max(normalized, 0), 1);
        
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
                <Text style={styles.hudText}>[ OPTICAL FLUID SENSOR ]</Text>
                {/* Mostramos el valor suavizado para que veas que no salta tanto */}
                <Text style={styles.bigData}>{displayLux} LUX</Text> 
            </View>

            <View style={styles.lightBarContainer}>
                {/* Barra visual también suavizada */}
                <View style={[styles.lightBarFill, { height: `${Math.min((displayLux/1500)*100, 100)}%` }]} />
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>EXIT VISION</Text>
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
    zIndex: 999,
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Más oscuro para concentrarse en el sonido
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50
  },
  hudText: {
    color: '#00ffff', // CAMBIO DE COLOR A CYAN (Estilo V2)
    fontFamily: 'System',
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center'
  },
  bigData: {
    color: '#00ffff',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 255, 0.5)',
    textShadowRadius: 10
  },
  lightBarContainer: {
    position: 'absolute',
    right: 20,
    top: 100,
    bottom: 100,
    width: 20,
    borderColor: '#00ffff',
    borderWidth: 1,
    justifyContent: 'flex-end'
  },
  lightBarFill: {
    backgroundColor: 'rgba(0, 255, 255, 0.6)',
    width: '100%'
  },
  closeBtn: {
    alignSelf: 'center',
    marginBottom: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 20, 20, 0.8)'
  },
  closeText: {
    color: '#00ffff',
    fontWeight: 'bold',
    letterSpacing: 1
  }
});