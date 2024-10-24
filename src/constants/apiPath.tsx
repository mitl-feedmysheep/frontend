const baseUrl = 'http://localhost:8020/';

// member
const GET_VERIFICATION_CODE = `${baseUrl}app/member/phone/send-verification-code`;
const CHECK_VERIFICATION_CODE = `${baseUrl}app/member/phone/check-verification-code`;
const CHECK_EMAIL = `${baseUrl}app/member/email/check-duplication`;
const SIGN_UP = `${baseUrl}app/member/sign-up`;
const SIGN_IN = `${baseUrl}app/member/sign-in`;

//church
const CHURCHES = `${baseUrl}app/churches`;
const GET_CHURCH_BODIES = (churchId: number) =>
  `${baseUrl}app/church/${churchId}/bodies`;

const GET_USER_CHURCH_LIST = `${baseUrl}app/member/churches-with-bodies`;
const GET_USER_INFO = `${baseUrl}app/member/info`;
const GET_APP_MEDIA_LIST = `${baseUrl}app/medias`;
const GET_APP_TEXT = `${baseUrl}app/text`;
const GET_APP_WORDS = `${baseUrl}app/word`;
const GET_USER_CELL_LIST = (bodyId: number) =>
  `${baseUrl}app/member/body/${bodyId}/cells`;
const GET_CHURCH_EVENT_LIST = (bodyId: number) =>
  `${baseUrl}app/church/body/${bodyId}/member-events`;

export {
  baseUrl,
  GET_VERIFICATION_CODE,
  CHECK_VERIFICATION_CODE,
  CHECK_EMAIL,
  SIGN_UP,
  SIGN_IN,
  CHURCHES,
  GET_CHURCH_BODIES,
  GET_USER_CHURCH_LIST,
  GET_USER_INFO,
  GET_APP_MEDIA_LIST,
  GET_APP_TEXT,
  GET_APP_WORDS,
  GET_USER_CELL_LIST,
  GET_CHURCH_EVENT_LIST,
};
