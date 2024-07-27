import React from "react";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";
import { OnboardingData } from "../data";
import FastImage from "react-native-fast-image";

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

const StyledImage = styled(FastImage)`
    width: 250px;
    height: 350px;
`;

const RenderOnboardingPage = ({ item }: Props) => {
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

    return (
        <RenderOnboardingPageView width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            bgColor={item.backgroundColor}
        >
            <StyledImage source={item.image} resizeMode="contain" />
            <StyledText color={item.textColor}>
                {item.text}
            </StyledText>
        </RenderOnboardingPageView>
    )
};

export default RenderOnboardingPage;