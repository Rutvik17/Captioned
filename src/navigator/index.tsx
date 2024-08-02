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
import * as SplashScreen from 'expo-splash-screen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useCaptionedStore from '../store';

export type RootStackParamList = {
    OnboardingPage: undefined;
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
    const Stack = createNativeStackNavigator<RootStackParamList>();
    const Tab = createBottomTabNavigator();
    const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const cameraPermission = Camera.getCameraPermissionStatus();
    const microphonePermission = Camera.getMicrophonePermissionStatus();
    const { stack } = useCaptionedStore();

    const showPermissionsPage = cameraPermission !== 'granted' || microphonePermission === 'not-determined';

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

    const OnboardingStack = () => {
        return (
            <StyledGestureHandlerRootView onLayout={() => SplashScreen.hideAsync()}>
                <Stack.Navigator
                    initialRouteName={!onboardingComplete ? 'OnboardingPage' : 'PermissionsPage'}
                    screenOptions={{
                        headerShown: false,
                        animationTypeForReplace: 'pop',
                    }}
                >
                    <Stack.Screen name="OnboardingPage" component={OnboardingPage} />
                    <Stack.Screen
                        name="PermissionsPage"
                        component={PermissionsPage}
                        options={{
                            gestureEnabled: false
                        }}
                    />
                </Stack.Navigator>
            </StyledGestureHandlerRootView>
        )
    };

    if ((!onboardingComplete || showPermissionsPage) && stack === 'onboarding') {
        return <OnboardingStack />
    }

    const CameraStack = () => {
        return (
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
                    options={{
                        gestureEnabled: false,
                    }}
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
        )
    }

    return (
        <StyledGestureHandlerRootView onLayout={() => SplashScreen.hideAsync()}>
            <Tab.Navigator>
                <Tab.Screen
                    name="Feed"
                    component={CameraStack}
                    options={{ headerShown: false }}
                />
                <Tab.Screen
                    name="Camera"
                    options={{ headerShown: false }}
                    component={CameraStack}
                />
            </Tab.Navigator>
        </StyledGestureHandlerRootView>
    )
};

export default RootNavigator;