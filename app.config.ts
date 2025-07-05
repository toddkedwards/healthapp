import { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: "GeekFit",
  slug: "GeekFit",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSHealthShareUsageDescription: "GeekFit needs access to your health data to track your fitness progress and sync with quests and achievements.",
      NSHealthUpdateUsageDescription: "GeekFit needs access to your health data to track your fitness progress and sync with quests and achievements."
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    permissions: [
      "android.permission.ACTIVITY_RECOGNITION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-notifications"
  ]
}); 