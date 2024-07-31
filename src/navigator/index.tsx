import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import OnboardingPage from '../components/onboarding';
import PermissionsPage from '../components/camera/permissions';
import { Camera } from 'react-native-vision-camera';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { MediaPage } from '../components/media';
import CameraPage from '../components/camera';
import CaptionsPage from '../components/captions';

export type RootStackParamList = {
    CameraPage: undefined;
    MediaPage: {
        path: string
        type: 'video' | 'photo'
    };
    CaptionsPage: undefined;
};

export type OnboardingStackParamList = {
    OnboardingPage: undefined;
    PermissionsPage: undefined;
};

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`flex: 1`;

const RootNavigator = () => {
    const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const cameraPermission = Camera.getCameraPermissionStatus();
    const microphonePermission = Camera.getMicrophonePermissionStatus();

    const [showPermissionsPage, setShowPermissionsPage] = useState(cameraPermission !== 'granted' || microphonePermission === 'not-determined');

    useEffect(() => {
        (async () => {
            const onboarding = await SecureStore.getItemAsync('onboarding');
            if (onboarding === 'complete') {
                setOnboardingComplete(true);
            }
            setLoading(false);
            await SplashScreen.hideAsync();
        })();
    }, [])

    if (loading) return;

    if (!onboardingComplete) {
        return <OnboardingNavigator
            initialRouteName={'OnboardingPage'}
            setShowPermissionsPage={setShowPermissionsPage}
            setOnboardingComplete={setOnboardingComplete}
        />
    };

    if (showPermissionsPage) {
        return <OnboardingNavigator
            initialRouteName={'PermissionsPage'}
            setShowPermissionsPage={setShowPermissionsPage}
            setOnboardingComplete={setOnboardingComplete}
        />
    }

    return (
        <HomeNavigator />
    );
};

const HomeNavigator = () => {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <StyledGestureHandlerRootView>
            <Stack.Navigator
                initialRouteName={'CameraPage'}
                screenOptions={{
                    headerShown: false,
                    animationTypeForReplace: 'pop',
                }}
            >
                <Stack.Screen
                    name="CameraPage"
                    component={CameraPage}
                />
                <Stack.Screen
                    name="MediaPage"
                    component={MediaPage}
                    options={{
                        gestureEnabled: false
                    }}
                />
                <Stack.Screen
                    name="CaptionsPage"
                    component={CaptionsPage}
                    options={{
                        presentation: 'modal',
                        gestureEnabled: false
                    }}
                />
            </Stack.Navigator>
        </StyledGestureHandlerRootView>
    )
};

type OnboardingNavigatorProps = {
    initialRouteName: keyof OnboardingStackParamList;
    setShowPermissionsPage: React.Dispatch<React.SetStateAction<boolean>>;
    setOnboardingComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

const OnboardingNavigator = ({ initialRouteName, setShowPermissionsPage, setOnboardingComplete }: OnboardingNavigatorProps) => {
    const Stack = createNativeStackNavigator<OnboardingStackParamList>();

    return (
        <StyledGestureHandlerRootView>
            <Stack.Navigator
                initialRouteName={initialRouteName}
                screenOptions={{
                    headerShown: false,
                    animationTypeForReplace: 'push',
                }}
            >
                <Stack.Screen name="OnboardingPage">
                    {(props) => <OnboardingPage {...props} setOnboardingComplete={setOnboardingComplete} />}
                </Stack.Screen>
                <Stack.Screen name="PermissionsPage" >
                    {(props) => <PermissionsPage {...props} setShowPermissionsPage={setShowPermissionsPage} />}
                </Stack.Screen>
            </Stack.Navigator>
        </StyledGestureHandlerRootView>
    );
};

export default RootNavigator;