import { AnimationObject } from "lottie-react-native";

export interface OnboardingData {
    id: number;
    image: string | AnimationObject | { uri: string; };
    title: string;
    text: string;
    textColor: string;
    backgroundColor: string;
  }

export const onboardingData: OnboardingData[] = [
    {
        id: 1,
        image: require('../../../assets/images/camera.json'), // asset reference https://lottiefiles.com/free-animation/digital-camera-JY4VmkfSx9
        title: 'Capture Your Moments',
        text: 'Snap photos and videos with ease using our integrated camera. Get ready to capture your favorite moments!',
        textColor: '#7899D4',
        backgroundColor: '#A2B9E2',
    },
    {
        id: 2,
        image: require('../../../assets/images/generative-ai.json'), // asset reference https://lottiefiles.com/free-animation/microsoft-designer-ssup1h3YOA
        title: 'AI-Generated Captions',
        text: 'Upload your photos to our AI, powered by Gemini, and receive accurate and creative captions instantly.',
        textColor: '#3B69BA',
        backgroundColor: '#7899D4',
    },
    {
        id: 3,
        image: require('../../../assets/images/world.json'), // asset reference https://lottiefiles.com/free-animation/world-QtOgIWd8i5
        title: 'Share with the World',
        text: 'Display your photos with AI-generated captions and share them with friends and family around the globe. Unleash your creativity!',
        textColor: '#1D355D',
        backgroundColor: '#3B69BA',
    },
];