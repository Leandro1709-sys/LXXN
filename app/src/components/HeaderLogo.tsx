import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { logoStyles } from '../styles/AppStyles';

interface HeaderLogoProps {
  status: string;
  onOpenManual: () => void;
}

export const HeaderLogo = ({ status, onOpenManual }: HeaderLogoProps) => (
  <View style={logoStyles.container}>
    <View style={logoStyles.lcdScreen}>
        <Text style={logoStyles.lcdText}>{status}</Text>
        <View style={logoStyles.scanline}/>
    </View>
    <View style={logoStyles.logoWrapper}>
      <View>
          <Text style={[logoStyles.brandText, logoStyles.glitchLayer]}>LXXN</Text>
          <Text style={logoStyles.brandText}>LXXN</Text>
          <Text style={logoStyles.modelText}>STATION_V2</Text>
      </View>
   {/* BOTÓN ACTUALIZADO */}
      <TouchableOpacity onPress={onOpenManual} style={logoStyles.infoBtn}>
         <Text style={logoStyles.infoBtnText}>+INFO</Text> 
      </TouchableOpacity>
    </View>
  </View>
);