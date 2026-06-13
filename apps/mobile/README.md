# Mobile App

Expo React Native app that consumes the web app API.

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run start
```

For production:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-domain.com
eas build --platform android --profile production
eas build --platform ios --profile production
```
