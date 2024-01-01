import axios from "axios";
import {
  GET_VERIFICATION_NUMBER,
  CHECK_VERIFICATION_NUMBER,
  GET_USER_CELL_LIST,
  GET_USER_INFO,
  GET_CHURCH_EVENT_LIST,
  GET_APP_MEDIA_LIST,
  GET_APP_TEXT,
  GET_APP_WORDS,
  GET_USER_CHURCH_LIST,
} from "../constants/apiPath";

type CommonResponse<T> = {
  common: {
    status: string;
    message: string;
  };
  data: T;
}

const getVerificationNumber = async (phone: string) => {
  const result = await axios.get(GET_VERIFICATION_NUMBER, {
    params: {
      phone,
    },
  });
  return result;
};

interface checkVerificationNumberProps {
  phone: string;
  code: string;
}

const checkVerificationNumber = async ({
  phone,
  code,
}: checkVerificationNumberProps) => {
  const result = await axios.get(CHECK_VERIFICATION_NUMBER, {
    params: {
      phone,
      code,
    },
  });
  return result;
};

const getUserChurchList = async () => {
  const result = await axios.get(GET_USER_CHURCH_LIST);
  return result.data;
}

const getUserInfo = async () => {
  const result = await axios.get(GET_USER_INFO);
  return result.data;
}

const getAppMediaList = async (screenKey: string) => {
  const result = await axios.get(GET_APP_MEDIA_LIST, { params: { screenKey } });
  return result.data;
}

const getAppText = async (screenKey: string) => {
  const result = await axios.get(GET_APP_TEXT, { params: { screenKey } });
  return result.data;
}

const getAppWords = async (screenKey: string) => {
  const result = await axios.get(GET_APP_WORDS, { params: { screenKey } });
  return result.data;
}

const getUserCellList = async (bodyId: number) => {
  const result = await axios.get(GET_USER_CELL_LIST(bodyId))
  return result.data;
}

const getChurchEventList = async (bodyId: number, year: string, month: string, offset: number, limit = 20) => {
  const result = await axios.get(GET_CHURCH_EVENT_LIST(bodyId), { params: { year, month, offset, limit } });
  return result.data;
}

export { 
  getVerificationNumber,
  checkVerificationNumber,
  getUserChurchList,
  getUserInfo,
  getAppMediaList,
  getAppText,
  getAppWords,
  getUserCellList, 
  getChurchEventList,
};
