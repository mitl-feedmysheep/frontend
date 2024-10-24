export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ChurchRegistration: undefined;
  ChurchRegistrationComplete: undefined;
  Home: undefined;
  SearchAddress: undefined;
  MeetingDetails: { passedScreenType?: MeetingDetailsScreenStep };
  MeetingComplete: undefined;
};

export type MeetingDetailsScreenStep = 'infomation' | 'pray' | 'view';
