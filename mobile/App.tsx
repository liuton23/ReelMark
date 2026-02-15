import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message'; // Add import
import theme from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="dark" />
        <Toast />
      </NavigationContainer>
    </PaperProvider>
  );
}