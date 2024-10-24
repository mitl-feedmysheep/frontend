import React, { useEffect, useMemo, useState } from 'react';
import { TextInputProps } from 'react-native';
import { styled } from 'styled-components/native';

import InactiveEye from '../../assets/icon/ic-eye-close-line.svg';
import ActiveEye from '../../assets/icon/ic-eye-line.svg';

interface CustomTextInputProps extends TextInputProps {
  isPassword?: boolean;
  validate?: (text: string) => boolean;
  validateText?: string;
}

const CustomTextInput = ({
  isPassword = false,
  value,
  onChangeText,
  editable,
  placeholder,
  validate,
  validateText,
  ...rest
}: CustomTextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [valid, setValid] = useState(true);
  // const inputRef = useRef(null);

  useEffect(() => {
    console.log('valid>>>', valid);
  }, [valid]);

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  const handleEmailChange = (text: string) => {
    if (onChangeText) onChangeText(text);
    if (validate) setValid(validate(text));
  };

  return (
    <Container>
      <TextInputContainer>
        <TextInput
          value={value}
          onChangeText={handleEmailChange}
          scrollEnabled={false}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor="#A5BAAF"
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={isPassword && !isPasswordShown}
          valid={valid}
          {...rest}
        />
        {isPassword && (
          <ViewPasswordButton
            activeOpacity={1}
            onPress={() => setIsPasswordShown(!isPasswordShown)}>
            {isPasswordShown ? <ActiveEye /> : <InactiveEye />}
          </ViewPasswordButton>
        )}
      </TextInputContainer>
      {validateText && !valid && <ValidateText>{validateText}</ValidateText>}
    </Container>
  );
};

const Container = styled.SafeAreaView`
  display: flex;
  flex-direction: column;
`;

const TextInputContainer = styled.View`
  position: relative;
  flex-direction: row;
`;

const TextInput = styled.TextInput<{ valid: boolean }>`
  display: flex;
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border-color: ${({ valid }) => (valid ? 'transparent' : '#DB574F')};
  border-width: 1px;
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  color: #405347;
  background-color: #f5f7f5;
`;

const ViewPasswordButton = styled.TouchableOpacity`
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  right: 12px;
  top: 50%;
  transform: translateY(-16px);
`;

const ValidateText = styled.Text`
  margin-top: 8px;
  color: #db574f;
  font-family: Pretendard-Light;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

export default CustomTextInput;
