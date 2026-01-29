import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence, 
  withRepeat 
} from 'react-native-reanimated';

// Tamaño de cada celda (ajustar si tu grilla es distinta, pero suele ser flex)
interface LedCellProps {
  row: number;
  col: number;
  color: string; // Recibimos el color dinámico
}

export const LedCell = React.memo(({ row, col, color }: LedCellProps) => {
  // Opacidad aleatoria para dar efecto "vivo"
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    // Generamos un parpadeo aleatorio tipo "circuitry"
    const randomDelay = Math.random() * 2000;
    const randomDuration = 500 + Math.random() * 1000;
    
    opacity.value = withDelay(
      randomDelay,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: randomDuration }), // Sube brillo
          withTiming(0.1, { duration: randomDuration })  // Baja brillo
        ),
        -1, // Infinito
        true // Reverse
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      backgroundColor: color, // Usamos el color que viene del Index
    };
  });

  return (
    <View style={styles.cellContainer}>
      <Animated.View style={[styles.led, animatedStyle]} />
    </View>
  );
});

const styles = StyleSheet.create({
  cellContainer: {
    width: '12.5%', // 100% / 8 columnas
    height: '12.5%', // 100% / 8 filas
    padding: 1, // Espacio entre leds (rejilla negra)
    borderColor: '#000',
    borderWidth: 0.5,
  },
  led: {
    flex: 1,
    borderRadius: 2, // Un poco redondeado para parecer led
  },
});