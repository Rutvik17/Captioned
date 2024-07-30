import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigator';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase';

SplashScreen.preventAutoHideAsync();

initializeApp(firebaseConfig)

export default function App() {
  return (
    <NavigationContainer onReady={() => SplashScreen.hideAsync()}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <RootNavigator />
      </View>
    </NavigationContainer>
  );
}