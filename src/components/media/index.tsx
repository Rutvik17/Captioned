import React, { useCallback, useMemo, useState } from 'react'
import type { ImageLoadEventData, NativeSyntheticEvent } from 'react-native'
import { StyleSheet, ActivityIndicator, PermissionsAndroid, Platform, Image } from 'react-native'
import type { OnVideoErrorData, OnLoadData } from 'react-native-video'
import Video from 'react-native-video'
import { PressableOpacity } from 'react-native-pressable-opacity'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { Alert } from 'react-native'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useIsFocused } from '@react-navigation/core'
import { RootStackParamList } from '../../navigator'
import { StatusBarBlurBackground } from '../camera/statusBarBlurBackground'
import { useIsForeground } from '../camera/hooks/useIsForeground'
import { SAFE_AREA_PADDING, SCREEN_WIDTH } from '../camera/constants'
import styled from 'styled-components/native'
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { captionsPrompt } from '../../utils/prompt'
import useCaptionedStore from '../../store'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const requestSavePermission = async (): Promise<boolean> => {
    // On Android 13 and above, scoped storage is used instead and no permission is needed
    if (Platform.OS !== 'android' || Platform.Version >= 33) return true

    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    if (permission == null) return false
    let hasPermission = await PermissionsAndroid.check(permission)
    if (!hasPermission) {
        const permissionRequestResult = await PermissionsAndroid.request(permission)
        hasPermission = permissionRequestResult === 'granted'
    }
    return hasPermission
}

type OnLoadImage = NativeSyntheticEvent<ImageLoadEventData>
const isVideoOnLoadEvent = (event: OnLoadData | OnLoadImage): event is OnLoadData => 'duration' in event && 'naturalSize' in event

type Props = NativeStackScreenProps<RootStackParamList, 'MediaPage'>

const MediaPageView = styled.View`
    flex: 1;
`
const CloseButton = styled(PressableOpacity)`
    position: absolute;
    top: ${SAFE_AREA_PADDING.paddingTop}px;
    left: ${SAFE_AREA_PADDING.paddingLeft}px;
    width: 40px;
    height: 40px;
`;

const UploadButtons = styled.View`
    position: absolute;
    bottom: ${SAFE_AREA_PADDING.paddingBottom}px;
    right: ${SAFE_AREA_PADDING.paddingRight}px;
`;

const DownloadButtons = styled.View`
    position: absolute;
    bottom: ${SAFE_AREA_PADDING.paddingBottom}px;
    left: ${SAFE_AREA_PADDING.paddingLeft}px;
`;

const IconButton = styled(PressableOpacity)`
    padding: 16px;
`;

const UploadingBar = styled(Animated.View)`
    height: 5px;
    z-index: 1;
    background: #1D355D;
    width: ${SCREEN_WIDTH}px;
    top: ${SAFE_AREA_PADDING.paddingTop - 15}px;
`;

const GeneratingCaptionText = styled.Text`
    position: absolute;
    font-size: 14px;
    color: white;
    z-index: 2;
    text-align: center;
    width: ${SCREEN_WIDTH}px;
    bottom: ${SAFE_AREA_PADDING.paddingBottom + 100}px;
`;

export function MediaPage({ navigation, route }: Props): React.ReactElement {
    const { path, type } = route.params;
    const { updateMedia } = useCaptionedStore();
    const [hasMediaLoaded, setHasMediaLoaded] = useState(false)
    const isForeground = useIsForeground()
    const isScreenFocused = useIsFocused()
    const isVideoPaused = !isForeground || !isScreenFocused
    const [savingState, setSavingState] = useState<'none' | 'saving' | 'saved'>('none')
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [generatingCaption, setGeneratingCaption] = useState(false);
    const progressBarX = useSharedValue(0);

    const onMediaLoad = useCallback((event: OnLoadData | OnLoadImage) => {
        if (isVideoOnLoadEvent(event)) {
            console.log(
                `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
            )
        } else {
            const source = event.nativeEvent.source
            console.log(`Image loaded. Size: ${source.width}x${source.height}`)
        }
    }, [])
    const onMediaLoadEnd = useCallback(() => {
        console.log('media has loaded.')
        setHasMediaLoaded(true)
    }, [])
    const onMediaLoadError = useCallback((error: OnVideoErrorData) => {
        console.log(`failed to load media: ${JSON.stringify(error)}`)
    }, [])

    const onSavePressed = useCallback(async () => {
        try {
            setSavingState('saving')

            const hasPermission = await requestSavePermission()
            if (!hasPermission) {
                Alert.alert('Permission denied!', 'Captioned does not have permission to save the media to your camera roll.')
                return
            }
            await CameraRoll.save(`file://${path}`, {
                type: type,
            })
            setSavingState('saved')
        } catch (e) {
            const message = e instanceof Error ? e.message : JSON.stringify(e)
            setSavingState('none')
            Alert.alert('Failed to save!', `An unexpected error occured while trying to save your ${type}. ${message}`)
        }
    }, [path, type])

    const uploadMedia = useCallback(async () => {
        const filename = path.substring(path.lastIndexOf('/') + 1);
        const storagePath = type === 'photo' ? `images/${filename}` : `videos/${filename}`;
        const storage = getStorage();
        const storageRef = ref(storage, storagePath);
        const response = await fetch(path);
        const uploadTask = uploadBytesResumable(storageRef, await response.blob());
        uploadTask.on('state_changed',
            (snapshot) => {
                // Handle progress
                setUploadingMedia(true);
                progressBarX.value = withTiming((snapshot.bytesTransferred / snapshot.totalBytes) * SCREEN_WIDTH, { duration: 500 });
            },
            (error) => {
                // Handle error
                console.log(error)
            },
            async () => {
                setTimeout(() => {
                    setUploadingMedia(false);
                }, 500)
                try {
                    setGeneratingCaption(true);
                    const generateMediaCaptions = httpsCallable(getFunctions(), 'generateMediaCaptions')
                    const result = await generateMediaCaptions({
                        path: storagePath,
                        type: type,
                        prompt: captionsPrompt(type)
                    });
                    setGeneratingCaption(false);
                    updateMedia({
                        path: path,
                        type: type,
                        captions: JSON.parse(result.data as string).captions as { type: string, caption: string }[]
                    });
                    navigation.navigate('CaptionsPage');
                } catch (error) {
                    console.error(error)
                }
            }
        );
    }, [])

    const source = useMemo(() => ({ uri: `file://${path}` }), [path])

    const screenStyle = useMemo(() => ({ opacity: hasMediaLoaded ? 1 : 0 }), [hasMediaLoaded])

    const progressBarStyle = useAnimatedStyle(() => {
        return {
            width: progressBarX.value,
        };
    });

    return (
        <MediaPageView style={[screenStyle]}>
            {uploadingMedia && <UploadingBar style={progressBarStyle} />}
            {type === 'photo' && (
                <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" onLoadEnd={onMediaLoadEnd} onLoad={onMediaLoad} />
            )}
            {type === 'video' && (
                <Video
                    source={source}
                    style={StyleSheet.absoluteFill}
                    paused={isVideoPaused}
                    resizeMode="cover"
                    allowsExternalPlayback={false}
                    automaticallyWaitsToMinimizeStalling={false}
                    disableFocus={true}
                    repeat={true}
                    controls={false}
                    playWhenInactive={true}
                    ignoreSilentSwitch="ignore"
                    onReadyForDisplay={onMediaLoadEnd}
                    onLoad={onMediaLoad}
                    onError={onMediaLoadError}
                />
            )}
            {generatingCaption &&
                <GeneratingCaptionText>
                    Generating caption...
                </GeneratingCaptionText>
            }
            <CloseButton onPress={navigation.goBack}>
                <IonIcon name="close" size={35} color="white" style={styles.icon} />
            </CloseButton>

            <DownloadButtons>
                <IconButton onPress={onSavePressed} disabled={savingState !== 'none'}>
                    {savingState === 'none' && <IonIcon name="download" size={35} color="white" style={styles.icon} />}
                    {savingState === 'saved' && <IonIcon name="checkmark" size={35} color="white" style={styles.icon} />}
                    {savingState === 'saving' && <ActivityIndicator color="white" />}
                </IconButton>
            </DownloadButtons>

            <UploadButtons>
                <IconButton onPress={uploadMedia}>
                    <IonIcon name="logo-closed-captioning" size={35} color="white" style={styles.icon} />
                </IconButton>
            </UploadButtons>

            <StatusBarBlurBackground />
        </MediaPageView>
    )
}

const styles = StyleSheet.create({
    icon: {
        textShadowColor: 'black',
        textShadowOffset: {
            height: 0,
            width: 0,
        },
        textShadowRadius: 1,
    },
})