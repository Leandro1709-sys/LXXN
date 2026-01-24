import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { styles } from '../styles/AppStyles';
import { LED_CELL_SIZE } from '../constants/Layout';

export const LedCell = ({ row, col }: { row: number, col: number }) => {
  const opacity = useSharedValue(0.2);
  useEffect(() => { 
      opacity.value = withDelay(
          Math.random()*2000, 
          withRepeat(
              withTiming(Math.random()*0.8+0.2, {duration:1000+Math.random()*2000, easing:Easing.inOut(Easing.ease)}), 
              -1, 
              true
          )
      ); 
  }, []);
  
  return <Animated.View style={[styles.ledCell, {top:row*LED_CELL_SIZE, left:col*LED_CELL_SIZE}, useAnimatedStyle(()=>({opacity:opacity.value}))]}/>;
};