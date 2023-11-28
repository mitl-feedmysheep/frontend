import React, { useEffect } from "react";
import { styled } from "styled-components/native";
import LogoSvg from "../assets/splash/logo.svg";
import AppNameSvg from "../assets/splash/app-name.svg";
import { colorSet } from "../constants";

type Props = {};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login");
    }, 2000);
  }, []);

  return (
    <Container>
      <LogoSvg />
      <AppNameSvg />
      <BibleText>
        {`이같이 너희 빛을 사람 앞에 비취게 하여\n저희로 너희 착한 행실을 보고\n하늘에 계신 너희 아버지께 영광을 돌리게 하라.\n마5:16`}
      </BibleText>
    </Container>
  );
};

const Container = styled.View`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const BibleText = styled.Text`
  display: flex;
  margin-top: 24px;
  font-family: Pretendard-Regular;
  color: ${colorSet.neutral.N5};
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 19px;
  letter-spacing: 0.3px;
`;

export default SplashScreen;
