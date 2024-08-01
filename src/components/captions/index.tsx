import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { View, Animated, ScrollView, StyleSheet, Alert } from 'react-native';
import { SAFE_AREA_PADDING, SCREEN_HEIGHT, SCREEN_WIDTH } from '../camera/constants';
import { PressableOpacity } from 'react-native-pressable-opacity';
import { FlatList } from 'react-native-gesture-handler';
import useCaptionedStore from '../../store';
import IonIcon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';

const showAlert = (description: string) => {
    Alert.alert(
        'Copied to clipboard!',
        description,
        [
            { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
    );
};

interface DataItem {
    key: string;
    type: string;
    caption: string;
    ref: React.RefObject<View>
};

const RootView = styled.View`
    flex: 1;
    background-color: rgba(0,0,0,0.3); 
`;

const RootFlatList = styled(FlatList)``;

const RenderItemView = styled(ScrollView).attrs({
    contentContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 24
    },
})`
    flex:1;
    padding: 24px;
    margin-top: 150px;
    width: ${SCREEN_WIDTH}px;
    height: ${SCREEN_HEIGHT - SCREEN_WIDTH}px;
`;

const TabsOuterView = styled.View`
    top: 125px;
    position: absolute;
    width: ${SCREEN_WIDTH}px;
`;

const TabsInnerView = styled(View)`
    flex: 1;
    justify-content: space-evenly;
    flex-direction: row;
`;

const TabText = styled.Text<{ size: number }>`
    color: rgba(140, 140, 140, 0.8);
    font-size: ${props => props.size}px;
    font-weight: 800;
    text-transform: uppercase;
    font-style: italic;
`;

const IndicatorView = styled(Animated.View)`
    position: absolute;
    height: 4px;
    background-color: rgba(140, 140, 140, 0.8);
    bottom: -4px;
`;

const CaptionText = styled.Text`
    font-size: 48px;
    color: white;
`;

const UploadButtons = styled.View`
    position: absolute;
    flex-direction: row;
    justify-content: space-evenly;
    width: ${SCREEN_WIDTH}px;
    bottom: ${SAFE_AREA_PADDING.paddingBottom}px;
`;

const Header = styled.View`
    height: 40px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    top: ${SAFE_AREA_PADDING.paddingTop}px;
`;

const Title = styled.Text`
    font-size: 24px;
    color: white;
`;

const CloseButton = styled(PressableOpacity)`
    z-index: 1;
    width: 40px;
    height: 40px;
    position: absolute;
    align-items: center;
    justify-content: center;
    top: ${SAFE_AREA_PADDING.paddingTop}px;
    left: ${SAFE_AREA_PADDING.paddingLeft}px;
`;

const IconButton = styled(PressableOpacity)`
    padding: 16px;
`;

const Tab = forwardRef<View, { item: DataItem, len: number }>((props, ref) => {
    const { item, len } = props;
    return (
        <View ref={ref}>
            <TabText size={45 / len}>{item.type}</TabText>
        </View>
    )
});

const Indicator = ({ measures, scrollX, data }:
    {
        measures: {}[],
        scrollX: Animated.Value,
        data: DataItem[]
    }) => {

    const indicatorWidth = scrollX.interpolate({
        inputRange: [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
        outputRange: [88.66666412353516, 134, 70.66665649414062]
    })
    const translateX = scrollX.interpolate({
        inputRange: [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
        outputRange: [24.33333396911621, 137, 295]
    })
    return <IndicatorView style={[
        {
            width: indicatorWidth,
            left: 0,
            transform: [{
                translateX
            }]
        }
    ]} />;
}

const Tabs = ({ scrollX, data, onItemPress }: { scrollX: Animated.Value, data: DataItem[], onItemPress: (itemIndex: number) => void }) => {
    const [measures, setMeasures] = useState([{}]);
    const containerRef = useRef<View>(null);

    useEffect(() => {
        const measurements: Array<{}> = [];
        data.forEach(item => {
            if (item.ref.current) {
                item.ref.current.measureLayout(
                    containerRef.current as View,
                    (x, y, width, height) => {
                        measurements.push({ x, y, width, height })
                        if (measurements.length === data.length) setMeasures(measurements);
                    });
            }
        })
    }, []);

    return (
        <TabsOuterView>
            <TabsInnerView ref={containerRef}>
                {data.map((item, index) =>
                    <PressableOpacity key={item.key} onPress={() => onItemPress(index)}>
                        <Tab item={item} ref={item.ref} len={data.length} />
                    </PressableOpacity>
                )}
            </TabsInnerView>
            {measures.length > 0 && <Indicator measures={measures} scrollX={scrollX} data={data} />}
        </TabsOuterView>
    );
}

const CaptionsPage = () => {
    const { media } = useCaptionedStore();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const handleScroll = (x: any) => {
            const modulus = x.value % SCREEN_WIDTH;
            if (modulus === 0) {
                setCaption(data[x.value / SCREEN_WIDTH].caption);
            }
        };

        scrollX.addListener(handleScroll);
        return () => scrollX.removeAllListeners()
    }, []);

    const [caption, setCaption] = useState('');

    const data: DataItem[] = media.captions.map((caption, index) => ({
        key: `${index}`,
        type: caption.type,
        caption: caption.caption,
        ref: React.createRef()
    }));

    const onItemPress = useCallback((itemIndex: number) => {
        flatListRef.current?.scrollToOffset({
            offset: itemIndex * SCREEN_WIDTH
        })
    }, []);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(caption);
        showAlert(caption);
    };

    return (
        <RootView>
            <CloseButton onPress={() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'CameraPage' }],
                });
            }}>
                <IonIcon name="close" size={35} color="white" style={styles.icon} />
            </CloseButton>
            <Header>
                {/* <View style={{ width: 80, height: 40 }} /> */}
                <Title>
                    CAPTIONS
                </Title>
                {/* <View style={{ width: 80, height: 40 }} /> */}
            </Header>

            <RootFlatList
                ref={flatListRef}
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => {
                    const renderItem = item as DataItem;
                    return renderItem.key
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                renderItem={({ item }) => {
                    const renderItem = item as DataItem;
                    return (
                        <RenderItemView>
                            <CaptionText>
                                {renderItem.caption}
                            </CaptionText>
                        </RenderItemView>
                    );
                }}
            />

            <Tabs scrollX={scrollX} data={data} onItemPress={onItemPress} />

            <UploadButtons>
                <IconButton onPress={copyToClipboard}>
                    <IonIcon name="copy" size={35} color="white" style={styles.icon} />
                </IconButton>

                <IconButton onPress={() => { }}>
                    <IonIcon name="logo-twitter" size={35} color="white" style={styles.icon} />
                </IconButton>
            </UploadButtons>
        </RootView>
    );
};

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

export default CaptionsPage;