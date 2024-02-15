import React, { useMemo, useState } from "react";
import { TextInputProps } from "react-native";
import { styled } from "styled-components/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EmptyArea, Header, Typo } from "../components/common";
import { MainButton } from "../components/buttons";
import { colorSet } from "../constants";
import { RootStackParamList } from "../types/common";

type Props = NativeStackScreenProps<RootStackParamList, "MeetingDetails">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isAbleToLogin = useMemo(() => {
    if (email.length > 0 && password.length > 0) return true;
    return false;
  }, [email, password]);

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
          />
          <EmptyArea height={12} />
          <CustomTextInput
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
            }}
            placeholder="비밀번호 입력"
            keyboardType="email-address"
            secureTextEntry
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
              // navigation.navigate("MeetingDetails", {
              //   passedScreenType: "infomation",
              // });
              // navigation.navigate("MeetingDetails", {
              //   passedScreenType: "view",
              // });
              navigation.replace("Home");
            }}
          />
          <EmptyArea height={12} />
          <SignupContainer>
            <SignupText1>계정이 없으신가요? </SignupText1>
            <SignupButton
              activeOpacity={1}
              onPress={() => {
                navigation.navigate("Signup");
                // navigation.navigate("ChurchRegistration");
              }}
            >
              <SignupText2>회원가입하기</SignupText2>
            </SignupButton>
          </SignupContainer>
        </InnnerContainer>
      </AvoidingView>
    </Container>
  );
};

const CustomTextInput = ({
  value,
  onChangeText,
  editable,
  placeholder,
  inputRef,
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  // const inputRef = useRef(null);

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  return (
    <TextInputContainer>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        scrollEnabled={false}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor="#A5BAAF"
        onFocus={onFocus}
        onBlur={onBlur}
        ref={inputRef}
      />
      {/* {value && value.length > 0 && isFocused && (
        <CloseCircleButton
          onPress={() => {
            if (onChangeText) onChangeText("");
          }}
          activeOpacity={1}
        >
          <CloseCircle />
        </CloseCircleButton>
      )} */}
    </TextInputContainer>
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

const TextInputContainer = styled.View`
  flex-direction: row;
  position: relative;
`;

const TextInput = styled.TextInput`
  display: flex;
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  color: #405347;
  background-color: #f5f7f5;
`;

export default LoginScreen;
