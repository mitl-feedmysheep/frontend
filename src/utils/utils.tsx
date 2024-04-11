import Toast from "react-native-toast-message";
import { getStatusBarHeight } from "react-native-safearea-height";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const showToast = (text: string, type: string) => {
  Toast.show({
    type,
    props: { text },
    position: "top",
    topOffset: getStatusBarHeight() + 41,
  });
};

export const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

export const storeJsonData = async (key: string, value: Object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
  }
};

export const getJsonData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};
