import React, { useEffect, useMemo, useState } from "react";
import { styled } from "styled-components/native";
import { TextInputWithTitle } from "../components/text_input";
import { EmptyArea, Header, Typo, Shadow } from "../components/common";
import { RoundButton } from "../components/buttons";
import { colorSet } from "../constants";

type Props = {};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isAbleToLogin = useMemo(() => {
    if (email.length > 0 && password.length > 0) return true;
    return false;
  }, [email, password]);

  return (
    <Container>
      <AvoidingView stickyHeaderIndices={[0]}>
        <Header title="홈" />
        <InnnerContainer></InnnerContainer>
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

export default HomeScreen;
