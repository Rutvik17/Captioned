import { ImageRequireSource } from 'react-native';

export interface OnboardingData {
    id: number;
    image: ImageRequireSource;
    text: string;
    textColor: string;
    backgroundColor: string;
  }

export const onboardingData: OnboardingData[] = [
    {
        id: 1,
        image: require('../../../assets/images/cars.png'),
        text: 'SEE',
        textColor: '#7899D4',
        backgroundColor: '#A2B9E2',
    },
    {
        id: 2,
        image: require('../../../assets/images/camera.png'),
        text: 'CAPTURE',
        textColor: '#3B69BA',
        backgroundColor: '#7899D4',
    },
    {
        id: 3,
        image: require('../../../assets/images/flight.png'),
        text: 'EXPLORE',
        textColor: '#1D355D',
        backgroundColor: '#3B69BA',
    },
];