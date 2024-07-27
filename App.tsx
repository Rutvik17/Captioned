import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Onboarding from './src/components/onboarding';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigator';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Camera } from 'react-native-vision-camera';
import PermissionsPage from './src/components/camera/permissions';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const cameraPermission = Camera.getCameraPermissionStatus();
  const microphonePermission = Camera.getMicrophonePermissionStatus();

  const [showPermissionsPage, setShowPermissionsPage] = useState(cameraPermission !== 'granted' || microphonePermission === 'not-determined')

  useEffect(() => {
    (async () => {
      const onboarding = await SecureStore.getItemAsync('onboarding');
      if (onboarding === 'complete') {
        setOnboardingComplete(true);
      }
      setLoading(false);
    })();
  }, [])

  if (loading) {
    return;
  }

  return (
    <NavigationContainer onReady={() => SplashScreen.hideAsync()}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        {!onboardingComplete ?
          <Onboarding setOnboardingComplete={setOnboardingComplete} /> :
          showPermissionsPage ?
            <PermissionsPage setShowPermissionsPage={setShowPermissionsPage} />
            : <RootNavigator />
        }
      </View>
    </NavigationContainer>
  );
}