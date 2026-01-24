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
                                LXXN STATION V2 [STABLE]{"\n"}
                                --------------------------------{"\n"}
                                1. XY PAD CONTROL (PERFORMANCE){"\n"}
                                • Eje X (Horiz): OCTAVAS (Izq=Grave / Der=Agudo){"\n"}
                                • Eje Y (Vert): PITCH BEND (Afinación Fina){"\n"}
                                Combinar ambos para crear melodías glitch.{"\n"}{"\n"}
                                
                                2. MEZCLA Y CONTROL (MIXER){"\n"}
                                • FADER INFERIOR: Controla el volumen INDEPENDIENTE del canal seleccionado.{"\n"}
                                • KILL ALL: Silencio total y reseteo de pitch.{"\n"}{"\n"}
                                
                                3. SLOTS DE FÁBRICA (INST/BASES){"\n"}
                                • UN TAP (Azul): Disparo único (One Shot).{"\n"}
                                • DOBLE TAP (Rojo): Modo Loop Infinito (Latch).{"\n"}{"\n"}
                                
                                4. MÓDULOS DE EXPANSIÓN (MIC & USER){"\n"}
                                Estos botones son "Híbridos". Cambian según su estado:{"\n"}{"\n"}

                                [ ESTADO 1: VACÍO ]{"\n"}
                                • USER: Un toque abre tus archivos. Carga MP3/WAV.{"\n"}
                                • MIC: Un toque inicia la grabación (Luz Roja).{"\n"}
                                       Otro toque finaliza y guarda el sample.{"\n"}{"\n"}

                                [ ESTADO 2: INSTRUMENTO ]{"\n"}
                                • Una vez cargado el audio, el botón se vuelve de color.{"\n"}
                                • AHORA ES UN SINTETIZADOR: Úsalo en el XY PAD.{"\n"}
                                • Aplica Pitch, Efectos y Loops como cualquier otro.{"\n"}{"\n"}

                                [ RESET / BORRAR ]{"\n"}
                                • ¿No te gustó la grabación?{"\n"}
                                • MANTENER PRESIONADO (Long Press) el botón para{"\n"}
                                  eliminar el audio de la memoria y liberar el slot.
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