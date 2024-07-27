import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import CameraPage from '../components/camera';

export type RootStackParamList = {
    PermissionsPage: undefined;
    CameraPage: undefined;
    MediaPage: {
        path: string
        type: 'video' | 'photo'
    };
    Devices: undefined;
    CodeScannerPage: undefined;
};

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`flex: 1`;

const RootNavigator = () => {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <StyledGestureHandlerRootView>
            <Stack.Navigator
                initialRouteName={'CameraPage'}
                screenOptions={{
                    headerShown: false,
                    animationTypeForReplace: 'push',
                }}
            >
                <Stack.Screen
                    name="CameraPage"
                    component={CameraPage}
                />
            </Stack.Navigator>
        </StyledGestureHandlerRootView >
    )
};

export default RootNavigator;