import axios from "axios";
import {
  GET_VERIFICATION_CODE,
  CHECK_VERIFICATION_CODE,
  CHECK_EMAIL,
  SIGN_UP,
  SIGN_IN,
  CHURCHES,
  GET_CHURCH_BODIES,
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
};

const getVerificationCode = async (phone: string) => {
  const result = await axios.get(GET_VERIFICATION_CODE, {
    params: {
      phone,
    },
  });
  return result;
};

interface checkVerificationCodeProps {
  phone: string;
  code: string;
}

const checkVerificationCode = async ({
  phone,
  code,
}: checkVerificationCodeProps) => {
  const result = await axios.get(CHECK_VERIFICATION_CODE, {
    params: {
      phone,
      code,
    },
  });
  return result;
};

const checkEmail = async (email: string) => {
  const result = await axios.get(CHECK_EMAIL, {
    params: {
      email,
    },
  });
  return result;
};

const signUp = async (props) => {
  const result = await axios.post(SIGN_UP, {
    ...props,
  });
  return result;
};

const signIn = async (props) => {
  const result = await axios.post(SIGN_IN, {
    ...props,
  });
  return result;
};

const getChurches = async (churchName, token) => {
  const result = await axios.get(CHURCHES, {
    params: {
      churchName,
    },
    headers: {
      "fms-token": token,
    },
  });
  return result;
};

const getChurchBodies = async (churchId, token) => {
  const result = await axios.get(GET_CHURCH_BODIES(churchId), {
    params: {
      churchId,
    },
    headers: {
      "fms-token": token,
    },
  });
  return result;
};

const getUserChurchList = async () => {
  const result = await axios.get(GET_USER_CHURCH_LIST);
  return result.data;
};

const getUserInfo = async () => {
  const result = await axios.get(GET_USER_INFO);
  return result.data;
};

const getAppMediaList = async (screenKey: string) => {
  const result = await axios.get(GET_APP_MEDIA_LIST, { params: { screenKey } });
  return result.data;
};

const getAppText = async (screenKey: string) => {
  const result = await axios.get(GET_APP_TEXT, { params: { screenKey } });
  return result.data;
};

const getAppWords = async (screenKey: string) => {
  const result = await axios.get(GET_APP_WORDS, { params: { screenKey } });
  return result.data;
};

const getUserCellList = async (bodyId: number) => {
  const result = await axios.get(GET_USER_CELL_LIST(bodyId));
  return result.data;
};

const getChurchEventList = async (
  bodyId: number,
  year: string,
  month: string,
  offset: number,
  limit = 20
) => {
  const result = await axios.get(GET_CHURCH_EVENT_LIST(bodyId), {
    params: { year, month, offset, limit },
  });
  return result.data;
};

export {
  getVerificationCode,
  checkVerificationCode,
  checkEmail,
  signUp,
  signIn,
  getChurches,
  getChurchBodies,
  getUserChurchList,
  getUserInfo,
  getAppMediaList,
  getAppText,
  getAppWords,
  getUserCellList,
  getChurchEventList,
};
