import React, { useEffect, useMemo, useState } from "react";
import { styled } from "styled-components/native";
import { TextInputWithTitle } from "../components/text_input";
import { EmptyArea, Header, Typo, Shadow } from "../components/common";
import { RoundButton } from "../components/buttons";
import { colorSet } from "../constants";

type Props = {};

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
          <EmptyArea height={24} />
          <TextInputWithTitle
            textValue={email}
            title="이메일"
            placeholder="이메일을 입력해주세요!"
            keyboardType="email-address"
            onChangeText={(text: string) => {
              setEmail(text);
            }}
            // setText={setEmail}
          />
          <EmptyArea height={10} />
          <TextInputWithTitle
            textValue={password}
            title="비밀번호"
            placeholder="비밀번호를 입력해주세요!"
            keyboardType="email-address"
            secureTextEntry
            onChangeText={(text: string) => {
              setPassword(text);
            }}
          />
          <EmptyArea height={30} />
          <RoundButton
            buttonText="로그인"
            isActived={isAbleToLogin}
            onPress={() => {
              navigation.replace("Home");
            }}
          />
          <EmptyArea height={15} />
          <SignupContainer>
            <SignupButton
              activeOpacity={1}
              onPress={() => {
                navigation.navigate("Signup");
              }}
            >
              <Typo type="B2" color={colorSet.neutral.N5}>
                가입할래요!
              </Typo>
            </SignupButton>
            <EmptyArea width={10} />
            <SignupButton
              activeOpacity={1}
              onPress={() => {
                navigation.navigate("Signup");
              }}
            >
              <Typo type="B2" color={colorSet.neutral.N5}>
                고객센터 문의하기
              </Typo>
            </SignupButton>
          </SignupContainer>
          <EmptyArea height={76} />
          <Shadow type="xs">
            <BibleContainer>
              <BibleText
                size="small"
                type="caption"
                color={colorSet.neutral.N5}
                textAlign="center"
              >
                {`이같이 너희 빛을 사람 앞에 비취게 하여\n저희로 너희 착한 행실을 보고\n하늘에 계신 너희 아버지께 영광을 돌리게 하라.\n마5:16`}
              </BibleText>
            </BibleContainer>
          </Shadow>
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

const SignupButton = styled.TouchableOpacity`
  border-bottom-width: 1px;
  border-color: ${colorSet.neutral.N5};
`;

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

export default LoginScreen;
