import { AnimationObject } from "lottie-react-native";

export interface OnboardingData {
    id: number;
    image: string | AnimationObject | { uri: string; };
    text: string;
    textColor: string;
    backgroundColor: string;
  }

export const onboardingData: OnboardingData[] = [
    {
        id: 1,
        image: require('../../../assets/images/camera.json'),
        text: 'Capture the moment',
        textColor: '#7899D4',
        backgroundColor: '#A2B9E2',
    },
    {
        id: 2,
        image: require('../../../assets/images/generative-ai.json'),
        text: 'Generate caption',
        textColor: '#3B69BA',
        backgroundColor: '#7899D4',
    },
    {
        id: 3,
        image: require('../../../assets/images/world.json'),
        text: 'Show it off to the world.',
        textColor: '#1D355D',
        backgroundColor: '#3B69BA',
    },
];