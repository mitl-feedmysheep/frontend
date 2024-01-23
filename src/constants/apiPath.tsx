const baseUrl = "http://localhost:8020/";

// member
const GET_VERIFICATION_CODE = `${baseUrl}app/member/phone/send-verification-code`;
const CHECK_VERIFICATION_CODE = `${baseUrl}app/member/phone/check-verification-code`;
const CHECK_EMAIL = `${baseUrl}app/member/email/check-duplication`;
const SIGN_UP = `${baseUrl}app/member/sign-up`;
const SIGN_IN = `${baseUrl}app/member/sign-in`;

//church
const CHURCHES = `${baseUrl}app/churches`;
const GET_CHURCH_BODIES = (churchId) =>
  `${baseUrl}app/church/${churchId}/bodies`;

export {
  baseUrl,
  GET_VERIFICATION_CODE,
  CHECK_VERIFICATION_CODE,
  CHECK_EMAIL,
  SIGN_UP,
  SIGN_IN,
  CHURCHES,
  GET_CHURCH_BODIES,
};
