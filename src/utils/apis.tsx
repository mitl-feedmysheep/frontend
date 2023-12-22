import axios from "axios";
import {
  GET_VERIFICATION_NUMBER,
  CHECK_VERIFICATION_NUMBER,
} from "../constants/apiPath";

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

export { getVerificationNumber, checkVerificationNumber };
