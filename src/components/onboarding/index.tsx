import { Canvas, Circle, Group, Image, makeImageFromView, Mask, SkImage } from '@shopify/react-native-skia';
import React, { useRef, useState } from 'react';
import { PixelRatio, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import styled from 'styled-components/native';
import { onboardingData } from './data';
import OnboardingButton from './button';
import Pagination from './pagination';
import RenderOnboardingPage from './renderPage';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigator';

const OnboardingView = styled.View`
    flex: 1;
    align-items: center;
`;

const OnboardingPage = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const pd = PixelRatio.get();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [overlay, setOverlay] = useState<SkImage | null>(null);
    const mask = useSharedValue(0);
    const buttonVal = useSharedValue(0);

    const wait = async (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const handlePress = async () => {
        if (currentIndex === onboardingData.length - 1 && !active) {
            await SecureStore.setItemAsync('onboarding', 'complete');
            return navigation.navigate('PermissionsPage');
        }

        if (!active) {
            setActive(true);
            const snapshot1 = await makeImageFromView(ref);
            setOverlay(snapshot1);
            await wait(80);

            setCurrentIndex(prev => prev + 1);
            mask.value = withTiming(SCREEN_HEIGHT, { duration: 1000 });
            buttonVal.value = withTiming(buttonVal.value + SCREEN_HEIGHT);
            await wait(1000);

            setOverlay(null);
            mask.value = 0;
            setActive(false);
        }
    }

    return (
        <OnboardingView>
            <View ref={ref} collapsable={false}>
                {onboardingData.map((item, index) => {
                    return (
                        currentIndex === index && <RenderOnboardingPage item={item} key={index} />
                    );
                })}
            </View>
            {overlay && (
                <Canvas style={StyleSheet.absoluteFill} pointerEvents='none'>
                    <Mask mode='luminance'
                        mask={
                            <Group>
                                <Circle cx={SCREEN_WIDTH / 2}
                                    cy={SCREEN_HEIGHT - 160}
                                    r={SCREEN_HEIGHT}
                                    color="white" />
                                <Circle
                                    cx={SCREEN_WIDTH / 2}
                                    cy={SCREEN_HEIGHT - 160}
                                    r={mask}
                                    color="black"
                                />
                            </Group>
                        }
                    >
                        <Image
                            image={overlay}
                            x={0}
                            y={0}
                            width={overlay.width() / pd}
                            height={overlay.height() / pd}
                        />
                    </Mask>
                </Canvas>
            )}
            <OnboardingButton handlePress={handlePress} buttonVal={buttonVal} />
            <Pagination data={onboardingData} buttonVal={buttonVal} />
        </OnboardingView>
    )
};

export default OnboardingPage;