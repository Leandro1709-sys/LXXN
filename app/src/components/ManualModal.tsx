import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Linking } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedScrollHandler 
} from 'react-native-reanimated';
import { modalStyles } from '../styles/AppStyles';

// --- DEFINICIÓN DE LINKS ---
const SOCIAL_LINKS = {
    instagram: 'https://instagram.com/lxxn.station',
    cafecito: 'https://cafecito.app/lxxn'
};

interface ManualModalProps {
    visible: boolean;
    onClose: () => void;
}

export const ManualModal = ({ visible, onClose }: ManualModalProps) => {
    // 1. ESTADOS
    const [contentHeight, setContentHeight] = useState(1);
    const [visibleSize, setVisibleSize] = useState(1);

    // 2. ANIMACIONES
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => { 
        scrollY.value = event.contentOffset.y; 
    });

    const scrollIndicatorStyle = useAnimatedStyle(() => {
        if (contentHeight <= visibleSize || contentHeight === 0) return { opacity: 0 };
        const indicatorSize = (visibleSize / contentHeight) * visibleSize;
        const actualIndicatorSize = Math.max(30, indicatorSize);
        const maxScroll = contentHeight - visibleSize;
        const maxTranslate = visibleSize - actualIndicatorSize;
        const translateY = (scrollY.value / maxScroll) * maxTranslate;
        
        return { 
            height: actualIndicatorSize, 
            transform: [{ translateY: Math.max(0, Math.min(translateY, maxTranslate)) }], 
            opacity: 1 
        };
    });

    // 3. RENDER
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <Text style={modalStyles.title}>// SYSTEM MANUAL //</Text>
                    
                    <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden', marginBottom: 10 }}>
                        <Animated.ScrollView 
                            style={modalStyles.scroll} 
                            contentContainerStyle={{paddingRight: 15, paddingBottom: 10}}
                            onScroll={scrollHandler} 
                            scrollEventThrottle={16} 
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={(w, h) => setContentHeight(h)} 
                            onLayout={(e) => setVisibleSize(e.nativeEvent.layout.height)}
                        >
                           <Text style={modalStyles.text}>
    LXXN STATION V2 [STABLE] - "NOISE PROTOCOL"{"\n"}
    ------------------------------------------------{"\n"}
    1. THEREMIN ÓPTICO (cámara frontal){"\n"}
    • SENSOR LUZ: Controla la frecuencia según el entorno.{"\n"}
    • LÓGICA: Oscuridad = Tonos graves / Luz = Tonos Agudos.{"\n"}
    • MONITOR: Barra roja en el Header indica entrada de lumen.{"\n"}{"\n"}

    2. SISTEMA DE ESTADOS Y COLORES (PADS){"\n"}
    • GRIS: Slot inactivo o vacío.{"\n"}
    • CIAN (Un toque): Seleccionado. El instrumento suena en el XY Pad.{"\n"}
    • ROJO (Doble toque): Modo HOLD. El bucle queda activo.{"\n"}
    • LONG PRESS: Borrar sample de la memoria (Mic/User).{"\n"}{"\n"}

    3. XY PAD CONTROL (PERFORMANCE){"\n"}
    • Eje X (Horiz): OCTAVAS (Frecuencia base).{"\n"}
    • Eje Y (Vert): PITCH BEND (Afinación sutil).{"\n"}
    • CENTRO: Velocidad 1.0 (Audio original).{"\n"}{"\n"}

    4. MEZCLA INTELIGENTE (MIXER){"\n"}
    • FADER: Control de volumen del canal activo.{"\n"}
    • HERENCIA: Cada nuevo disparo resta 10% de volumen al anterior{"\n"}
      para evitar saturación en la red sonora.{"\n"}
    • KILL ALL: Silencio total y reseteo de pánico.{"\n"}{"\n"}

    5. CAPTURA DE ENTORNO (MIC & USER){"\n"}
    • MIC: Un toque inicia grabación (Rojo). Otro toque guarda.{"\n"}
    • USER: Carga archivos locales (MP3/WAV).{"\n"}
    • Una vez cargado, el botón cambia de color y se vuelve{"\n"}
      un sintetizador controlable en el Pad.{"\n"}{"\n"}

    "No es una app, es una red de trabajo comunitario."
</Text>
                        </Animated.ScrollView>
                        
                        <View style={modalStyles.scrollTrack}>
                            <Animated.View style={[modalStyles.scrollThumb, scrollIndicatorStyle]} />
                        </View>
                    </View>

                    <View style={modalStyles.footer}>
                        <Text style={modalStyles.sectionTitle}>// CONNECT //</Text>
                        
                        <TouchableOpacity style={modalStyles.linkButton} onPress={() => Linking.openURL(SOCIAL_LINKS.instagram)}>
                            <Text style={modalStyles.linkText}> SEGUINOS EN INSTAGRAM</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[modalStyles.linkButton, { borderColor: '#00e5ff' }]} onPress={() => Linking.openURL(SOCIAL_LINKS.cafecito)}>
                            <Text style={[modalStyles.linkText, { color: '#00e5ff' }]}>DONAR EN CAFECITO ☕</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
                            <Text style={modalStyles.closeText}>CLOSE TERMINAL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};