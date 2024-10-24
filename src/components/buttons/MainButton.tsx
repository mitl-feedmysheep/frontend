import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components/native';
import { colorSet } from '../../constants';
import { Shadow } from '../common';

type AllButtonStateType = 'active' | 'disabled' | 'state3';
type ActiveButtonStateType = 'active' | 'state3';

interface Props {
  activeType?: ActiveButtonStateType;
  buttonText: string;
  width?: number;
  isActived: boolean;
  onPress?: () => void;
}

const MainButton: React.FC<Props> = ({
  activeType = 'active',
  buttonText,
  isActived,
  width,
  onPress,
}) => {
  const [buttonState, setButtonState] = useState<AllButtonStateType>(
    isActived ? activeType : 'disabled',
  );

  useEffect(() => {
    setButtonState(isActived ? activeType : 'disabled');
  }, [isActived, activeType]);

  const onPressButton = () => {
    if (isActived && onPress) onPress();
  };

  return (
    <Container
      onPress={onPressButton}
      activeOpacity={1}
      buttonState={buttonState}
      disabled={!isActived}
      //   isActived={isActived}
      width={width}>
      <ButtonText isActived={isActived} buttonState={buttonState}>
        {buttonText}
      </ButtonText>
    </Container>
  );
};

const Container = styled.TouchableOpacity<{
  buttonState: AllButtonStateType;
  isActived: boolean;
  width?: number;
}>`
  height: 42px;
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background-color: ${({ buttonState }) => {
    if (buttonState === 'active') return '#5F7B6D';
    else if (buttonState === 'disabled') return '#A5BAAF';
    else return '#E4E5E4';
  }};
`;

const ButtonText = styled.Text<{
  buttonState: AllButtonStateType;
}>`
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 26px;
  color: ${({ buttonState }) => {
    if (buttonState === 'state3') return '#636663';
    else return '#ffffff';
  }};
  text-align: center;
  text-align: start;
`;

export default MainButton;
