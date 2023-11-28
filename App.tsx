/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from "react";
import type { PropsWithChildren } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import {
  SplashScreen,
  LoginScreen,
  SignupScreen,
  SignupCompleteScreen,
  ChurchRegistrationScreen,
  ChurchRegistrationCompleteScreen,
  HomeScreen,
} from "./src/screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from "react-native/Libraries/NewAppScreen";
import { styled } from "styled-components/native";
import { colorSet } from "./src/constants";
import { Typo } from "./src/components/common";

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
  const isDarkMode = useColorScheme() === "dark";

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
        <Stack.Screen
          name="ChurchRegistration"
          component={ChurchRegistrationScreen}
        />
        <Stack.Screen
          name="ChurchRegistrationComplete"
          component={ChurchRegistrationCompleteScreen}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}

export default App;
