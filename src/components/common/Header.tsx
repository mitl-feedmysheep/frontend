import React from "react";
import { styled } from "styled-components/native";
import { colorSet } from "../../constants";
import LeftArrow from "../../assets/buttons/left-arrow.svg";
import { useNavigation } from "@react-navigation/native";

type Props = {
  title: string;
  isLeftButton: boolean;
  onPressLeftButton: () => {};
};

const Header: React.FC<Props> = ({
  title,
  isLeftButton = false,
  onPressLeftButton,
}) => {
  const navigation = useNavigation();
  return (
    <Container>
      {isLeftButton && (
        <LeftButton
          activeOpacity={1}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <LeftArrow />
        </LeftButton>
      )}
      <Title>{title}</Title>
    </Container>
  );
};

const Container = styled.View`
  display: flex;
  flex-direction: row;
  height: 50px;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: #ffffffd1;
`;

const Title = styled.Text`
  font-family: Pretendard-Regular;
  color: ${colorSet.primary.P4_M};
  font-size: 17px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.425px;
`;

const LeftButton = styled.TouchableOpacity`
  position: absolute;
  left: 0px;
  height: 50px;
  width: 50px;
  justify-content: center;
  align-items: center;
`;

export default Header;
