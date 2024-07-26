import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export default function App() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  if (!hasPermission) {
    requestPermission();
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      {device &&
        <Camera
          device={device}
          isActive={true}
          style={StyleSheet.absoluteFill}
        />
      }
    </View>
  );
}