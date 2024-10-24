import React from 'react';
import { styled } from 'styled-components/native';
import { colorSet } from '../../constants';
import LeftArrow from '../../assets/buttons/left-arrow.svg';
import { useNavigation } from '@react-navigation/native';

interface Props {
  title: string;
  isLeftButton?: boolean;
  onPressLeftButton?: () => {};
}

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
          }}>
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
  height: 42px;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
`;

const Title = styled.Text`
  font-family: Pretendard-Regular;
  color: #313331;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: -0.408px;
`;

const LeftButton = styled.TouchableOpacity`
  position: absolute;
  left: 7px;
  height: 24px;
  width: 24px;
  justify-content: center;
  align-items: center;
`;

export default Header;
