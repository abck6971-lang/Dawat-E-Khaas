import { Platform } from 'react-native';

// Next.js API Base URL
// For local development on a physical device, we use the local IP instead of localhost
// If testing on Android Emulator, 10.0.2.2 points to the host machine's localhost
// If testing on Web, we can just use localhost or the relative path
export const API_BASE_URL = Platform.select({
  web: 'http://localhost:3000/api',
  android: 'http://192.168.100.36:3000/api', // Reverting to IP since physical device testing is common, fallback for emulator is 10.0.2.2
  ios: 'http://192.168.100.36:3000/api',
  default: 'http://192.168.100.36:3000/api',
});
