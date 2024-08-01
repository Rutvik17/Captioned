import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import OnboardingPage from '../components/onboarding';
import PermissionsPage from '../components/camera/permissions';
import { Camera } from 'react-native-vision-camera';
import * as SecureStore from 'expo-secure-store';
import { MediaPage } from '../components/media';
import CameraPage from '../components/camera';
import CaptionsPage from '../components/captions';

export type RootStackParamList = {
    PermissionsPage: undefined;
    CameraPage: undefined;
    MediaPage: {
        path: string
        type: 'video' | 'photo'
    };
    CaptionsPage: undefined;
};

export type OnboardingStackParamList = {
    OnboardingPage: undefined;
};

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`flex: 1`;

const RootNavigator = () => {
    const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            const onboarding = await SecureStore.getItemAsync('onboarding');
            if (onboarding === 'complete') {
                setOnboardingComplete(true);
            }
            setLoading(false);
        })();
    }, [])

    if (loading) return;

    if (!onboardingComplete) {
        return <OnboardingNavigator />
    };

    return (
        <HomeNavigator />
    );
};

const HomeNavigator = () => {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    const cameraPermission = Camera.getCameraPermissionStatus();
    const microphonePermission = Camera.getMicrophonePermissionStatus();

    const showPermissionsPage = cameraPermission !== 'granted' || microphonePermission === 'not-determined';

    return (
        <StyledGestureHandlerRootView>
            <Stack.Navigator
                initialRouteName={showPermissionsPage ? 'PermissionsPage' : 'CameraPage'}
                screenOptions={{
                    headerShown: false,
                    animationTypeForReplace: 'pop',
                }}
            >
                <Stack.Screen
                    name="PermissionsPage"
                    component={PermissionsPage}
                    options={{
                        presentation: 'modal',
                        gestureEnabled: false
                    }}
                />
                <Stack.Screen
                    name="CameraPage"
                    component={CameraPage}
                    options={{
                        gestureEnabled: false,
                    }}
                />
                <Stack.Screen
                    name="MediaPage"
                    component={MediaPage}
                    options={{
                        presentation: 'modal',
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

const OnboardingNavigator = () => {
    const Stack = createNativeStackNavigator<OnboardingStackParamList>();

    return (
        <StyledGestureHandlerRootView>
            <Stack.Navigator
                initialRouteName={'OnboardingPage'}
                screenOptions={{
                    headerShown: false,
                    animationTypeForReplace: 'push',
                }}
            >
                <Stack.Screen name="OnboardingPage" component={OnboardingPage} />
            </Stack.Navigator>
        </StyledGestureHandlerRootView>
    );
};

export default RootNavigator;