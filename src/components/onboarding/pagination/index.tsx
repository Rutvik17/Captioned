import React from "react";
import styled from "styled-components/native";
import { OnboardingData } from "../data";
import { SharedValue } from "react-native-reanimated";
import Dot from "../dot";

type Props = {
    data: OnboardingData[];
    buttonVal: SharedValue<number>;
};

const PaginationView = styled.View`
    flex-direction: row;
    position: absolute;
    bottom: 70px;
`;

const Pagination = ({ data, buttonVal }: Props) => {
    return (
        <PaginationView>
            {data.map((_, index) => (
                <Dot index={index} buttonVal={buttonVal} key={index} />
            ))}
        </PaginationView>
    );
};

export default Pagination;