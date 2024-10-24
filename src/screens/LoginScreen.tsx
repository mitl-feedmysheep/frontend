import React, { useEffect, useMemo, useState } from 'react';
import { TextInputProps } from 'react-native';
import { styled } from 'styled-components/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useMutation } from '@tanstack/react-query';

import { EmptyArea, Header, Typo } from '../components/common';
import { MainButton } from '../components/buttons';
import InactiveEye from '../assets/icon/ic-eye-close-line.svg';
import ActiveEye from '../assets/icon/ic-eye-line.svg';
import { colorSet } from '../constants';
import { RootStackParamList } from '../types/common';
import { signIn } from '../utils/apis';
import { signInQueryKey } from '../constants/apiQueryKeys';
import { getData, showToast, storeData } from '../utils/utils';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/storageKeys';
import { CustomTextInput } from '../components/text_input';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingDetails'>;

interface ApiProps {
  email: string;
  password: string;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isAbleToLogin = useMemo(() => {
    if (email.length > 0 && password.length > 0) return true;
    return false;
  }, [email, password]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [signInQueryKey, email, password],
    queryFn: () => signIn({ email, password }),
    enabled: false,
    gcTime: 0,
  });

  const signInMutation = useMutation({
    mutationKey: [signInQueryKey],
    mutationFn: (props: ApiProps) => signIn(props),
    onSuccess: async data => {
      if (data?.data?.common?.status === 'success') {
        if (data?.data?.data) {
          const { accessToken, refreshToken } = data.data.data;
          await storeData(ACCESS_TOKEN, accessToken);
          await storeData(REFRESH_TOKEN, refreshToken);
          navigation.replace('Home');
          return;
        }
        showToast(
          '로그인 정보가 잘못되었습니다. 고객센터에 문의해주세요.',
          'errorToast',
        );
      }

      showToast(`${data?.data?.common?.message}`, 'errorToast');
    },
  });

  const emailValidate = (value: string) => {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  };

  return (
    <Container>
      <AvoidingView stickyHeaderIndices={[0]}>
        <Header title="로그인" />
        <InnnerContainer>
          <EmptyArea height={170} />
          <CustomTextInput
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
            }}
            placeholder="이메일 주소 입력"
            keyboardType="email-address"
            validate={emailValidate}
            validateText="이메일 형식에 맞지 않아요."
          />
          <EmptyArea height={12} />
          <CustomTextInput
            isPassword
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
            }}
            placeholder="비밀번호 입력"
            keyboardType="email-address"
          />
          <EmptyArea height={12} />
          <SearchContainer>
            <SearchWrapper activeOpacity={1}>
              <SearchText>이메일 찾기</SearchText>
            </SearchWrapper>
            <VerticalLine />
            <SearchWrapper activeOpacity={1}>
              <SearchText>비밀번호 찾기</SearchText>
            </SearchWrapper>
          </SearchContainer>
          <EmptyArea height={32} />
          <MainButton
            buttonText="로그인"
            isActived={isAbleToLogin}
            activeType="active"
            onPress={() => {
              // signInMutation.mutate({ email, password });

              // navigation.replace("Home");
              // navigation.navigate("MeetingDetails", {
              //   passedScreenType: "infomation",
              // });
              navigation.navigate('MeetingDetails', {
                passedScreenType: 'view',
              });
            }}
          />
          <EmptyArea height={12} />
          <SignupContainer>
            <SignupText1>계정이 없으신가요? </SignupText1>
            <SignupButton
              activeOpacity={1}
              onPress={() => {
                navigation.navigate('Signup');
                // navigation.navigate("ChurchRegistration");
              }}>
              <SignupText2>회원가입하기</SignupText2>
            </SignupButton>
          </SignupContainer>
        </InnnerContainer>
      </AvoidingView>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  display: flex;
  flex: 1;
  background-color: white;
`;

const AvoidingView = styled.ScrollView`
  display: flex;
  flex: 1;
`;

const InnnerContainer = styled.View`
  display: flex;
  margin-horizontal: 24px;
  flex: 1;
`;

const SignupContainer = styled.SafeAreaView`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const SignupText1 = styled.Text`
  color: #636663;
  font-family: Pretendard-Light;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const SignupText2 = styled.Text`
  color: #636663;
  font-family: Pretendard-SemiBold;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const SignupButton = styled.TouchableOpacity``;

const BibleContainer = styled.View`
  display: inline-flex;
  padding: 25px 44.5px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 0.75px;
  border-color: ${colorSet.primary.P4_M};
  background-color: white;
`;

const BibleText = styled(Typo)`
  text-align: center;
`;

const SearchContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const SearchWrapper = styled.TouchableOpacity`
  border-bottom-width: 1px;
  border-color: #636663;
`;

const VerticalLine = styled.View`
  width: 1px;
  height: 12px;
  background-color: #afb2af;
`;

const SearchText = styled.Text`
  color: #636663;
  font-family: Pretendard-Light;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

export default LoginScreen;
