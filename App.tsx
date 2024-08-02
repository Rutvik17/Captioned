import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigator';
import './firebase.ts';

SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <RootNavigator />
      </View>
    </NavigationContainer>
  );
}