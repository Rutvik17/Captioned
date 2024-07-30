export default {
    expo: {
        name: "Captioned",
        slug: "captioned",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "Captioned needs access to your Camera.",
                NSMicrophoneUsageDescription: "Captioned needs access to your Microphone."
            },
            bundleIdentifier: "com.rutvik.dev.Captioned"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "android.permission.CAMERA",
                "android.permission.RECORD_AUDIO"
            ],
            package: "com.rutvik.dev.Captioned"
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            [
                "react-native-vision-camera",
                {
                    cameraPermissionText: "Captioned needs access to your Camera.",
                    enableMicrophonePermission: true,
                    microphonePermissionText: "Captioned needs access to your Microphone."
                }
            ],
            "expo-secure-store"
        ],
        extra: {
            eas: {
                projectId: process.env.EAS_PROJECT_ID
            },
            firebase: {
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID,
                measurementId: process.env.FIREBASE_MEASUREMENT_ID,
                databaseUrl: process.env.FIREBASE_DATABASE_URL
            }
        }
    }
}
  