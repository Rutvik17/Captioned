import React from "react";
import { useWindowDimensions } from "react-native";
import Animated, { Extrapolation, interpolate, interpolateColor, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import styled from "styled-components/native";

type Props = {
    index: number;
    buttonVal: SharedValue<number>;
};

const DotView = styled(Animated.View)`
    height: 10px;
    margin-horizontal: 5px;
    border-radius: 5px;
`;

const Dot = ({ index, buttonVal }: Props) => {
    const { height: SCREEN_HEIGHT } = useWindowDimensions();

    const animatedDotStyle = useAnimatedStyle(() => {
        const widthAnimation = interpolate(
            buttonVal.value,
            [
                (index - 1) * SCREEN_HEIGHT,
                index * SCREEN_HEIGHT,
                (index + 1) * SCREEN_HEIGHT,
            ],
            [10, 30, 10],
            Extrapolation.CLAMP,
        );

        const opacityAnimation = interpolate(
            buttonVal.value,
            [
                (index - 1) * SCREEN_HEIGHT,
                index * SCREEN_HEIGHT,
                (index + 1) * SCREEN_HEIGHT,
            ],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP,
        );
        return {
            width: widthAnimation,
            opacity: opacityAnimation,
        };
    });

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
    return (
        <DotView style={[animatedDotStyle, animatedColor]} />
    );
};

export default Dot;