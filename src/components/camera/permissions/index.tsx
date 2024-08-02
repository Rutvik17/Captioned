import React, { useCallback, useEffect, useState } from 'react'
import { Linking } from 'react-native'
import type { CameraPermissionStatus } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import styled from 'styled-components/native'
import LottieView from 'lottie-react-native';
import useCaptionedStore from '../../../store'

const BANNER_IMAGE = require('../../../../assets/images/camera.json');

const StyledPermissionsPage = styled.View`
    flex: 1;
    align-items: center;
    padding-top: 65px;
    background-color: #7899D4;
`;

const StyledButton = styled.TouchableOpacity`
    padding: 16px;
    margin: 16px 0;
    width: 250px;
    border-radius: 100px;
    background-color: #1D355D;
    justify-content: center;
    align-items: center;
`;

const StyledButtonText = styled.Text`
    color: white;
    font-size: 20px;
`;

const StyledText = styled.Text`
    font-size: 24px;
    text-align: center;
    font-color: #1D355D;
    font-style: italic;
    margin-horizontal: 20px;
`;

const PermissionsPage = (): React.ReactElement => {
    const { updateStack } = useCaptionedStore();
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('not-determined')
    const [microphonePermissionStatus, setMicrophonePermissionStatus] = useState<CameraPermissionStatus>('not-determined')

    const requestMicrophonePermission = useCallback(async () => {
        console.log('Requesting microphone permission...')
        const permission = await Camera.requestMicrophonePermission()
        console.log(`Microphone permission status: ${permission}`)

        if (permission === 'denied') await Linking.openSettings()
        setMicrophonePermissionStatus(permission)
    }, [])

    const requestCameraPermission = useCallback(async () => {
        console.log('Requesting camera permission...')
        const permission = await Camera.requestCameraPermission()
        console.log(`Camera permission status: ${permission}`)

        if (permission === 'denied') await Linking.openSettings()
        setCameraPermissionStatus(permission)
    }, [])

    useEffect(() => {
        if (cameraPermissionStatus === 'granted' && microphonePermissionStatus === 'granted') {
            updateStack({ stack: 'root' })
        }
    }, [cameraPermissionStatus, microphonePermissionStatus])

    return (
        <StyledPermissionsPage>
            <LottieView
                autoPlay
                style={{
                    width: 250,
                    height: 250,
                }}
                source={BANNER_IMAGE}
            />
            <StyledText>
                Please grant Captioned permissions to following
            </StyledText>
            {cameraPermissionStatus !== 'granted' && (
                <StyledButton onPress={requestCameraPermission}>
                    <StyledButtonText>
                        Camera
                    </StyledButtonText>
                </StyledButton>
            )}
            {microphonePermissionStatus !== 'granted' && (
                <StyledButton onPress={requestMicrophonePermission}>
                    <StyledButtonText>
                        Microphone
                    </StyledButtonText>
                </StyledButton>
            )}
        </StyledPermissionsPage>
    )
};

export default PermissionsPage;