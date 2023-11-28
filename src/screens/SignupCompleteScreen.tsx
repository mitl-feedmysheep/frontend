import React from "react";
import { styled } from "styled-components/native";
import { EmptyArea, Typo } from "../components/common";
import { RoundButton } from "../components/buttons";
import AppNameSvg from "../assets/splash/app-name.svg";
import CongratsSvg from "../assets/images/congrats.svg";

type Props = {};

const SignupCompleteScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Container>
      <AvoidingView>
        <InnnerContainer>
          <EmptyArea height={42} />
          <AppNameSvg />
          <EmptyArea height={42} />
          <CongratsSvg />
          <Typo type="B2" textAlign="center">
            {`회원가입이 완료되었어요!\n사용하려면 교회를 등록해야해요`}
          </Typo>
          <EmptyArea height={40} />
        </InnnerContainer>
        <ButtonContainer>
          <RoundButton
            onPress={() => {
              navigation.replace("ChurchRegistration");
            }}
            buttonText="교회 등록하기"
            isActived={true}
          />
        </ButtonContainer>
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
  align-items: center;
  flex: 1;
`;

const ButtonContainer = styled.View`
  margin-horizontal: 24px;
`;

export default SignupCompleteScreen;
