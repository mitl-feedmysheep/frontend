import React, { useCallback, useMemo } from 'react';
import { styled } from 'styled-components/native';
import CheckBox from './CheckBox';
import EmptyArea from './EmptyArea';

interface Props {
  isChecked?: boolean;
  setIsChecked?: (isChecked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const CheckBoxWithLabel: React.FC<Props> = ({
  isChecked = false,
  setIsChecked,
  label,
  disabled = false,
}) => {
  const onPress = useMemo(() => {
    if (disabled) return () => {};
    return setIsChecked ? setIsChecked : () => {};
  }, [disabled, setIsChecked]);

  return (
    <Container activeOpacity={1} onPress={onPress} disabled={disabled}>
      <CheckBox isChecked={isChecked} setIsChecked={onPress} />
      <EmptyArea width={4} />
      <LabelText>{label}</LabelText>
    </Container>
  );
};

const Container = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const LabelText = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  color: #20342f;
  text-align: left;
`;

export default CheckBoxWithLabel;
