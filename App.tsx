/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  ChurchRegistrationCompleteScreen,
  ChurchRegistrationScreen,
  HomeScreen,
  LoginScreen,
  MeetingCompleteScreen,
  MeetingDetailsScreen,
  SignupCompleteScreen,
  SignupScreen,
  SplashScreen,
} from './src/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

import MeetingHomeScreen from '@screens/pray/MeetingHomeScreen';
import { styled } from 'styled-components/native';
import { Typo } from './src/components/common';
import { colorSet } from './src/constants';
import SearchAddress from './src/screens/SearchAddress';
import { RootStackParamList } from './src/types/common';

const toastConfig = {
  successToast: ({ props }) => {
    const { text } = props;

    return (
      <ToastContainer color={colorSet.primary.P2}>
        <Typo type="caption" color={colorSet.primary.P6}>
          {text}
        </Typo>
      </ToastContainer>
    );
  },
  errorToast: ({ props }) => {
    const { text } = props;

    return (
      <ToastContainer color={colorSet.accentError.W2}>
        <Typo type="caption" color={colorSet.accentError.W5} textAlign="center">
          {text}
        </Typo>
      </ToastContainer>
    );
  },
};

const ToastContainer = styled.View`
  padding: 6px 16px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  background-color: ${({ color }) => color};
`;

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen
            name="SignupComplete"
            component={SignupCompleteScreen}
          />
          <Stack.Screen
            name="ChurchRegistration"
            component={ChurchRegistrationScreen}
          />
          <Stack.Screen
            name="ChurchRegistrationComplete"
            component={ChurchRegistrationCompleteScreen}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SearchAddress" component={SearchAddress} />
          <Stack.Screen
            name="MeetingDetails"
            component={MeetingDetailsScreen}
          />
          <Stack.Screen
            name="MeetingComplete"
            component={MeetingCompleteScreen}
          />
          <Stack.Screen name="MeetingHome" component={MeetingHomeScreen} />
        </Stack.Navigator>
        <Toast config={toastConfig} />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

export default App;
