import React from "react";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";
import { OnboardingData } from "../data";
import LottieView from 'lottie-react-native';

type Props = {
    item: OnboardingData;
};


const RenderOnboardingPageView = styled.View<{ width: number, height: number, bgColor: string }>`
    flex: 1;
    align-items: center;
    padding-top: 40px;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    background-color: ${props => props.bgColor};
`;

const StyledText = styled.Text<{ color: string }>`
    margin-top: 10px;
    text-align: center;
    font-size: 48px;
    font-weight: bold;
    font-style: italic;
    margin-horizontal: 20px;
    color: ${props => props.color};
`;

const RenderOnboardingPage = ({ item }: Props) => {
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

    return (
        <RenderOnboardingPageView width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            bgColor={item.backgroundColor}
        >
            <LottieView
                autoPlay
                style={{
                    width: 250,
                    height: 250,
                }}
                source={item.image}
            />
            <StyledText color={item.textColor}>
                {item.text}
            </StyledText>
        </RenderOnboardingPageView>
    )
};

export default RenderOnboardingPage;