import axios from "axios";
import {
  GET_VERIFICATION_CODE,
  CHECK_VERIFICATION_CODE,
  CHECK_EMAIL,
  SIGN_UP,
  SIGN_IN,
  CHURCHES,
  GET_CHURCH_BODIES,
} from "../constants/apiPath";

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

export {
  getVerificationCode,
  checkVerificationCode,
  checkEmail,
  signUp,
  signIn,
  getChurches,
  getChurchBodies,
};
