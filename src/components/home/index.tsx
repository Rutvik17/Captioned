import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import CameraPage from '../camera';
import styled from 'styled-components/native';
import { StyleSheet, View, Animated } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../camera/constants';
import { PressableOpacity } from 'react-native-pressable-opacity';

interface DataItem {
    key: string;
    title: string;
    component: React.ComponentType;
    ref: React.RefObject<View>
}

const components: { [key: string]: React.ComponentType } = {
    camera: CameraPage,
    shop: CameraPage,
    discover: CameraPage,
};

const data: DataItem[] = Object.keys(components).map((i) => ({
    key: i,
    title: i,
    component: components[i],
    ref: React.createRef()
}));

const RootView = styled.View`
    flex: 1;
`;

const RootFlatList = styled(Animated.FlatList)``;

const RenderItemView = styled.View`
    flex:1;
    width: ${SCREEN_WIDTH}px;
    height: ${SCREEN_HEIGHT}px;
`;

const TabsOuterView = styled.View`
    top: 75px;
    position: absolute;
    width: ${SCREEN_WIDTH}px;
`;

const TabsInnerView = styled(View)`
    flex: 1;
    justify-content: space-evenly;
    flex-direction: row;
`;

const TabText = styled.Text`
    color: rgba(140, 140, 140, 0.8);
    font-size: ${60 / data.length}px;
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

const Tab = forwardRef<View, { item: DataItem }>((props, ref) => {
    const { item } = props;
    return (
        <View ref={ref}>
            <TabText>{item.title}</TabText>
        </View>
    )
});

const Indicator = ({ measures, scrollX }:
    {
        measures: {}[],
        scrollX: Animated.Value
    }) => {

    const inputRange = data.map((_, index) => index * SCREEN_WIDTH);

    const indicatorWidth = scrollX.interpolate({
        inputRange,
        outputRange: [84.33333587646484, 54.66667175292969, 99]
    })
    const translateX = scrollX.interpolate({
        inputRange,
        outputRange: [38, 160.3333282470703, 253]
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
                        <Tab item={item} ref={item.ref} />
                    </PressableOpacity>
                )}
            </TabsInnerView>
            {measures.length > 0 && <Indicator measures={measures} scrollX={scrollX} />}
        </TabsOuterView>
    );
}

const HomePage = () => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<Animated.FlatList>(null);
    const onItemPress = useCallback((itemIndex: number) => {
        flatListRef.current?.scrollToOffset({
            offset: itemIndex * SCREEN_WIDTH
        })
    }, []);
    return (
        <RootView>
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
                            {React.createElement(renderItem.component)}
                            <View
                                style={[StyleSheet.absoluteFillObject,
                                { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                            />
                        </RenderItemView>
                    );
                }}
            />
            <Tabs scrollX={scrollX} data={data} onItemPress={onItemPress} />
        </RootView>
    );
};

export default HomePage;