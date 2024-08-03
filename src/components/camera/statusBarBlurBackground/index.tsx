import type { BlurViewProps } from '@react-native-community/blur'
import { BlurView } from '@react-native-community/blur'
import React from 'react'
import { Platform } from 'react-native'
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets'
import styled from 'styled-components/native'

const FALLBACK_COLOR = 'rgba(140, 140, 140, 0.3)';

const StyledBlurView = styled(BlurView)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${StaticSafeAreaInsets.safeAreaInsetsTop}px;
`;

const StatusBarBlurBackgroundImpl = ({ style, ...props }: BlurViewProps): React.ReactElement | null => {
    if (Platform.OS !== 'ios') return null

    return (
        <StyledBlurView
            style={[style]}
            blurAmount={25}
            blurType="light"
            reducedTransparencyFallbackColor={FALLBACK_COLOR}
            {...props}
        />
    )
}

export const StatusBarBlurBackground = React.memo(StatusBarBlurBackgroundImpl);