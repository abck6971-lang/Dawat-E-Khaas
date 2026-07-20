import { Platform } from 'react-native';

const PRODUCTION_URL = 'https://dawat-e-khaas-web.vercel.app/api';

// In development you can override this to your local machine's IP.
// For production (APK / EAS build) it always uses the Vercel URL.
export const API_BASE_URL = __DEV__
  ? Platform.select({
      web: 'http://localhost:3000/api',
      android: 'http://192.168.100.36:3000/api',
      ios: 'http://192.168.100.36:3000/api',
      default: 'http://192.168.100.36:3000/api',
    })
  : PRODUCTION_URL;
