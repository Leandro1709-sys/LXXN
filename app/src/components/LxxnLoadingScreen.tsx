import React, { useEffect } from 'react';
import { View, Text, StatusBar, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, useSharedValue, withSpring, withRepeat, withTiming, withSequence, withDelay, FadeOut 
} from 'react-native-reanimated';
import { styles } from '../styles/AppStyles';

const { width } = Dimensions.get('window');

// Lógica interna para la grilla del logo
const LOGO_MAP = [[1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1],[1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,1,1,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1],[1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,1,0,0,1,1],[1,1,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1]];
const LOADING_COLS = 24;
const LOADING_CELL_SIZE = Math.min(width / LOADING_COLS, 20);

const LoadingCell = ({ isLogoPart }: { isLogoPart: number }) => {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(Math.random()*500, withRepeat(withSequence(withTiming(0.8,{duration:100}), withTiming(0.1,{duration:100})),6,true));
    setTimeout(() => { opacity.value = isLogoPart===1 ? withSpring(1) : withTiming(0.05); }, 1800);
  }, []);
  return <Animated.View style={[{ width:LOADING_CELL_SIZE-2, height:LOADING_CELL_SIZE-2, margin:1, borderWidth:1, borderRadius:2, backgroundColor:isLogoPart?'#f00':'#500', borderColor:isLogoPart?'#f33':'#200', opacity:opacity }]} />;
};

export const LxxnLoadingScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => { setTimeout(onFinish, 3500); }, []);
  return (
    <Animated.View exiting={FadeOut.duration(800)} style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={{alignItems:'center'}}>{LOGO_MAP.map((r,i)=><View key={i} style={{flexDirection:'row'}}>{r.map((c,j)=><LoadingCell key={`${i}-${j}`} isLogoPart={c}/>)}</View>)}</View>
      <Text style={styles.loadingText}>INITIALIZING MIXER...</Text>
    </Animated.View>
  );
};