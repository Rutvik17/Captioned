import * as React from 'react'
import { useRef, useState, useCallback, useMemo } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { StyleSheet } from 'react-native'
import { Gesture, GestureDetector, TapGestureHandler } from 'react-native-gesture-handler'
import type { CameraProps, CameraRuntimeError, PhotoFile, VideoFile } from 'react-native-vision-camera'
import {
    useCameraDevice,
    useCameraFormat,
    useLocationPermission,
    useMicrophonePermission,
} from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { CONTENT_SPACING, CONTROL_BUTTON_SIZE, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING, SCREEN_HEIGHT, SCREEN_WIDTH } from './constants'
import Reanimated, { Extrapolation, interpolate, useAnimatedProps, useSharedValue } from 'react-native-reanimated'
import { useEffect } from 'react'
import { PressableOpacity } from 'react-native-pressable-opacity'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import IonIcon from 'react-native-vector-icons/Ionicons'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useIsFocused } from '@react-navigation/core'
import { RootStackParamList } from '../../navigator'
import { CaptureButton } from './captureButton'
import { StatusBarBlurBackground } from './statusBarBlurBackground'
import { usePreferredCameraDevice } from './hooks/usePreferredCameraDevice'
import { useIsForeground } from './hooks/useIsForeground'
import styled from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
    zoom: true,
})

const SCALE_FULL_ZOOM = 3

const CameraPageView = styled.View`
    flex: 1;
    background-color: black;
`;

const StyledRightButtonRow = styled.View`
    position: absolute;
    right: ${SAFE_AREA_PADDING.paddingRight}px;
    bottom: ${SAFE_AREA_PADDING.paddingBottom}px;
`;

const StyledText = styled.Text`
    color: white;
    font-size: 11px;
    fon-weight: bold;
    text-align: center;
`;

const StyledEmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const CameraPage = (): React.ReactElement => {
    const camera = useRef<Camera>(null)
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const microphone = useMicrophonePermission()
    const location = useLocationPermission()
    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground

    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
    const [enableHdr, setEnableHdr] = useState(false)
    const [flash, setFlash] = useState<'off' | 'on'>('off')
    const [enableNightMode, setEnableNightMode] = useState(false)

    // camera device settings
    const [preferredDevice] = usePreferredCameraDevice()
    let device = useCameraDevice(cameraPosition)

    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
    }

    const [targetFps, setTargetFps] = useState(60)

    const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH
    const format = useCameraFormat(device, [
        { fps: targetFps },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: 'max' },
        { photoAspectRatio: screenAspectRatio },
        { photoResolution: 'max' },
    ])

    const fps = Math.min(format?.maxFps ?? 1, targetFps)

    const supportsFlash = device?.hasFlash ?? false
    const supportsHdr = format?.supportsPhotoHdr
    const supports60Fps = useMemo(() => device?.formats.some((f) => f.maxFps >= 60), [device?.formats])
    const canToggleNightMode = device?.supportsLowLightBoost ?? false

    //#region Animated Zoom
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
        return {
            zoom: z,
        }
    }, [maxZoom, minZoom, zoom])
    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
        },
        [isPressingButton],
    )
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])
    const onInitialized = useCallback(() => {
        console.log('Camera initialized!')
        setIsCameraInitialized(true)
    }, [])
    const onMediaCaptured = useCallback(
        (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
            console.log(`Media captured! ${JSON.stringify(media)}`)
            navigation.navigate('MediaPage', {
                path: media.path,
                type: type,
            })
        },
        [navigation],
    )
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
    }, [])
    const onFlashPressed = useCallback(() => {
        setFlash((f) => (f === 'off' ? 'on' : 'off'))
    }, [])
    //#endregion

    //#region Tap Gesture
    const onFocusTap = useCallback(
        ({ nativeEvent: event }: GestureResponderEvent) => {
            if (!device?.supportsFocus) return
            camera.current?.focus({
                x: event.locationX,
                y: event.locationY,
            })
        },
        [device?.supportsFocus],
    )
    const onDoubleTap = useCallback(() => {
        onFlipCameraPressed()
    }, [onFlipCameraPressed])
    //#endregion

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1
    }, [zoom, device])
    //#endregion

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            zoom.value = zoom.value;
        })
        .onUpdate((event) => {
            const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolation.CLAMP);
            zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, zoom.value,
                maxZoom], Extrapolation.CLAMP);
        });
    //#endregion

    useEffect(() => {
        const f =
            format != null
                ? `(${format.photoWidth}x${format.photoHeight} photo / ${format.videoWidth}x${format.videoHeight}@${format.maxFps} video @ ${fps}fps)`
                : undefined
        console.log(`Camera: ${device?.name} | Format: ${f}`)
    }, [device?.name, format, fps])

    useEffect(() => {
        location.requestPermission()
    }, [location])

    const videoHdr = format?.supportsVideoHdr && enableHdr
    const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr

    return (
        <CameraPageView>
            {!isActive &&
                <StyledEmptyContainer />
            }
            {device != null ? (
                <GestureDetector gesture={pinchGesture}>
                    <Reanimated.View onTouchEnd={onFocusTap} style={StyleSheet.absoluteFill}>
                        <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                            <ReanimatedCamera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={isActive}
                                ref={camera}
                                onInitialized={onInitialized}
                                onError={onError}
                                onStarted={() => console.log('Camera started!')}
                                onStopped={() => console.log('Camera stopped!')}
                                onPreviewStarted={() => console.log('Preview started!')}
                                onPreviewStopped={() => console.log('Preview stopped!')}
                                onOutputOrientationChanged={(o) => console.log(`Output orientation changed to ${o}!`)}
                                onPreviewOrientationChanged={(o) => console.log(`Preview orientation changed to ${o}!`)}
                                onUIRotationChanged={(degrees) => console.log(`UI Rotation changed: ${degrees}°`)}
                                format={format}
                                fps={fps}
                                photoHdr={photoHdr}
                                videoHdr={videoHdr}
                                photoQualityBalance="quality"
                                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                                enableZoomGesture={false}
                                animatedProps={cameraAnimatedProps}
                                exposure={0}
                                enableFpsGraph={false}
                                outputOrientation="device"
                                photo={true}
                                video={true}
                                audio={microphone.hasPermission}
                                enableLocation={location.hasPermission}
                            />
                        </TapGestureHandler>
                    </Reanimated.View>
                </GestureDetector>
            ) : (
                <StyledEmptyContainer>
                    <StyledText>Your phone does not support Found camera.</StyledText>
                </StyledEmptyContainer>
            )}

            <CaptureButton
                style={styles.captureButton}
                camera={camera}
                onMediaCaptured={onMediaCaptured}
                cameraZoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                flash={supportsFlash ? flash : 'off'}
                enabled={isCameraInitialized && isActive}
                setIsPressingButton={setIsPressingButton}
            />

            <StatusBarBlurBackground />

            <StyledRightButtonRow>
                <PressableOpacity style={styles.button} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
                    <IonIcon name="camera-reverse" color="white" size={24} />
                </PressableOpacity>
                {supportsFlash && (
                    <PressableOpacity style={styles.button} onPress={onFlashPressed} disabledOpacity={0.4}>
                        <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24} />
                    </PressableOpacity>
                )}
                {supports60Fps && (
                    <PressableOpacity style={styles.button} onPress={() => setTargetFps((t) => (t === 30 ? 60 : 30))}>
                        <StyledText>{`${targetFps}\nFPS`}</StyledText>
                    </PressableOpacity>
                )}
                {supportsHdr && (
                    <PressableOpacity style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
                        <MaterialIcon name={enableHdr ? 'hdr' : 'hdr-off'} color="white" size={24} />
                    </PressableOpacity>
                )}
                {canToggleNightMode && (
                    <PressableOpacity style={styles.button} onPress={() => setEnableNightMode(!enableNightMode)} disabledOpacity={0.4}>
                        <IonIcon name={enableNightMode ? 'moon' : 'moon-outline'} color="white" size={24} />
                    </PressableOpacity>
                )}
            </StyledRightButtonRow>
        </CameraPageView>
    )
}

const styles = StyleSheet.create({
    captureButton: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: SAFE_AREA_PADDING.paddingBottom,
    },
    button: {
        marginBottom: CONTENT_SPACING,
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default CameraPage;