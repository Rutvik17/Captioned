import React from "react";
import { TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import Animated, { interpolateColor, SharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import styled from "styled-components/native";

const OnboardingButtonView = styled(Animated.View)`
    position: absolute;
    bottom: 100px;
    z-index: 1;
    width: 120px;
    height: 120px;
    border-radius: 100px;
    justify-content: center;
    align-items: center;
`;

const AnimatedText = styled(Animated.Text)`
    color: white;
    font-size: 20px;
    position: absolute;
`;

type Props = {
    handlePress: () => void;
    buttonVal: SharedValue<number>;
};

const OnboardingButton = ({ handlePress, buttonVal }: Props) => {
    const { height: SCREEN_HEIGHT } = useWindowDimensions();

    const animatedColor = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            buttonVal.value,
            [0, SCREEN_HEIGHT, 2 * SCREEN_HEIGHT],
            ['#7899D4', '#3B69BA', '#1D355D'],
        );

        return {
            backgroundColor: backgroundColor,
        };
    });

    const buttonAnimationStyle = useAnimatedStyle(() => {
        return {
            width:
                buttonVal.value === 2 * SCREEN_HEIGHT
                    ? withSpring(260)
                    : withSpring(120),
            height:
                buttonVal.value === 2 * SCREEN_HEIGHT
                    ? withSpring(80)
                    : withSpring(120),
        };
    });

    const arrowAnimationStyle = useAnimatedStyle(() => {
        return {
            width: 50,
            height: 50,
            opacity:
                buttonVal.value === 2 * SCREEN_HEIGHT ? withTiming(0) : withTiming(1),
            transform: [
                {
                    translateX:
                        buttonVal.value === 2 * SCREEN_HEIGHT
                            ? withTiming(100)
                            : withTiming(0),
                },
            ],
        };
    });

    const textAnimationStyle = useAnimatedStyle(() => {
        return {
            opacity:
                buttonVal.value === 2 * SCREEN_HEIGHT ? withTiming(1) : withTiming(0),
            transform: [
                {
                    translateX:
                        buttonVal.value === 2 * SCREEN_HEIGHT
                            ? withTiming(0)
                            : withTiming(-100),
                },
            ],
        };
    });
    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <OnboardingButtonView style={[animatedColor, buttonAnimationStyle]}>
                <AnimatedText style={[textAnimationStyle]}>Get Started</AnimatedText>
                <Animated.Image source={require('../../../../assets/arrow-icon.png')}
                    style={arrowAnimationStyle} />
            </OnboardingButtonView>
        </TouchableWithoutFeedback>

    )
};

export default OnboardingButton;