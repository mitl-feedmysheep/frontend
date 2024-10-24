import React from 'react';
import { styled } from 'styled-components/native';
import { colorSet } from '../../constants';
import { Shadow } from '../common';

type Props = { buttonText: string; isActived: boolean; onPress: () => {} };

const RoundButton: React.FC<Props> = ({ buttonText, isActived, onPress }) => {
  const onPressButton = () => {
    if (isActived && onPress) onPress();
  };
  return (
    <Shadow type="sm">
      <LoginButton
        onPress={onPressButton}
        activeOpacity={1}
        isActived={isActived}>
        <LoginText isActived={isActived}>{buttonText}</LoginText>
      </LoginButton>
    </Shadow>
  );
};

const LoginButton = styled.TouchableOpacity`
  /* margin-horizontal: 24px; */
  padding: 11px 0px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 0.75px;
  border-color: ${colorSet.neutral.N4};
  background-color: ${({ isActived }) =>
    isActived ? colorSet.primary.P4_M : 'white'};
`;

const LoginText = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 17px;
  font-style: normal;
  font-weight: 400;
  line-height: 23px;
  letter-spacing: 0.425px;
  color: ${({ isActived }) =>
    isActived ? colorSet.neutral.N1 : colorSet.neutral.N5};
  text-align: center;
  text-align: start;
`;

export default RoundButton;
