import React from 'react';
import { styled } from 'styled-components/native';
import ActiveCheckBox from '../../assets/check-box/ic_checkbox_square_fill.svg';
import InactiveCheckBox from '../../assets/check-box/ic_checkbox_square_line.svg';

interface Props {
  isChecked?: boolean;
  setIsChecked?: (isChecked: boolean) => void;
}

const CheckBox: React.FC<Props> = ({ isChecked = false, setIsChecked }) => {
  const onPress = () => {
    if (setIsChecked) setIsChecked(!isChecked);
  };
  return (
    <Container activeOpacity={1} onPress={onPress}>
      {isChecked ? <ActiveCheckBox /> : <InactiveCheckBox />}
    </Container>
  );
};

const Container = styled.TouchableOpacity``;

export default CheckBox;
