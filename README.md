# Captioned

Welcome to **Captioned**, a beautifully animated React Native app built with Expo. Captioned allows users to take photos and videos, upload them to Gemini AI to generate captions and tweets, and copy the generated text to the clipboard. This guide will help you set up and run the project.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Installation](#installation)
4. [Running the App](#running-the-app)
5. [Firebase Functions](#firebase-functions)
6. [Scripts](#scripts)
7. [Project Structure](#project-structure)
8. [License](#license)

## Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- A Firebase project set up with Realtime Database, Storage, and Functions enabled

## Environment Variables

The app requires certain environment variables to connect to APIs and SDKs. Create a `.env` file in the root directory with the following content:

```plaintext
EAS_PROJECT_ID=

# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=
FIREBASE_DATABASE_URL=
```

Additionally, create a .env file in the functions directory for Firebase functions:

```plaintext
GEMINI_API_KEY=
MY_FIREBASE_STORAGE_BUCKET=
MY_FIREBASE_DATABASE_URL=
```

Download your Firebase Admin SDK JSON file from the Firebase Console and save it in the functions directory as firebase-admin.json.


## Installation

Follow these steps to set up the project:

1. Clone the repository:

```sh
git clone https://github.com/your-username/captioned.git
cd captioned
```

2. Install dependencies:
```sh
npm install
```

3. Install Firebase functions dependencies:
```sh
cd functions
npm install
cd ..
```

## Running the App

Use the following commands to run the app:

1. Start the Expo development server:
```sh
npm start
```

2. Run on Android:
```sh
npm run android
```

3. Run on iOS (requires a physical device):
```sh
npm run ios
```

4. Run on Web:
```sh
npm run web
```

## Firebase Functions

To develop and deploy Firebase functions, use the following commands:

1. Serve functions locally:
```sh
npm run serve
```

2. Run functions shell:
```sh
npm run shell
```

3. Deploy functions:
```sh
npm run deploy
```

3. View function logs:
```sh
npm run logs
```

## Scripts

Here are the scripts defined in the project:

### Root Directory `package.json` :

```json
"scripts": {
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios --device",
  "web": "expo start --web"
}
```

### Functions Directory `package.json` :

```json
"scripts": {
  "serve": "firebase emulators:start --only functions",
  "shell": "firebase functions:shell",
  "start": "npm run shell",
  "deploy": "firebase deploy --only functions",
  "logs": "firebase functions:log"
}
```

## Project Structure

The project's structure is as follows:

```bash
captioned/
├── .env
├── .expo/
├── android/
├── ios/
├── functions/
│   ├── .env
│   ├── firebase-admin.json
│   ├── index.js
│   └── package.json
├── node_modules/
├── assets/
├── src/
│   ├── components/
│   ├── api/
│   ├── navigator/
│   └── store/
│   └── utils/
├── .gitignore
├── .firebaserc
├── app.config.ts
├── App.tsx
├── babel.config.js
├── firebase.json
├── firebase.ts
├── package-lock.json
├── package.json
├── tsconfig.json
└── README.md
```

## License

This work is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0).

### Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

You are free to:

- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

Under the following terms:

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **NonCommercial** — You may not use the material for commercial purposes.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

[Read the full license](https://creativecommons.org/licenses/by-nc-sa/4.0).

We hope you enjoy using Captioned




