import React from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import CameraPage from '../camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigator';
import { useNavigation } from '@react-navigation/native';

const HomeFlatList = styled(FlatList<FlatListData>)`
    flex: 1;
`;

type FlatListData = {
    component: string;
}

const data: FlatListData[] = [
    { component: 'home' },
    { component: 'camera' },
    { component: 'discover' }
]

const Home = () => {
    const navigation = useNavigation<NativeStackScreenProps<RootStackParamList, 'HomePage'>>;
    const RenderItem = ({ item }: { item: FlatListData }) => {
        return <></>;
    };
    return (
        <HomeFlatList
            data={data}
            renderItem={({ item }) => (
                <RenderItem item={item} />
            )}
        />
    )
};

export default Home;