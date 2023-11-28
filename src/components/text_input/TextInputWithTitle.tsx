import React, { useMemo, useState } from "react";
import { styled } from "styled-components/native";
import MaskInput from "react-native-mask-input";
import { KeyboardAccessoryView } from "react-native-keyboard-accessory";
import { EmptyArea, Typo } from "../common";
import EyesSvg from "../../assets/buttons/eyes.svg";
import { colorSet } from "../../constants";
import { InputAccessoryView, Button } from "react-native";

type Props = {
  title: string;
  textValue: string;
  placeholder: string;
  keyboardType: string;
  secureTextEntry: boolean;
  isActived: boolean;
  maxLength: number;
  mask: any;
  onChangeText?: () => {};
  onFocus?: () => {};
  readOnly?: boolean;
  onPressOut?: () => {};
};

const TextInputWithTitle: React.FC<Props> = ({
  title,
  textValue,
  placeholder,
  keyboardType,
  secureTextEntry,
  isActived,
  maxLength,
  mask = [],
  onChangeText,
  onFocus,
  readOnly = false,
  onPressOut,
  // isActived,
}) => {
  const inputAccessoryViewID = "complete";
  const [isShownPassword, setIsShownPassword] = useState(false);
  const [isNameActivated, setIsNameActivated] = useState(false);
  return (
    <Container>
      <Typo
        type="actionBar"
        color={isActived ? colorSet.neutral.N7 : colorSet.neutral.N4}
      >
        {title}
      </Typo>
      <EmptyArea height={4} />
      <InputContainer isActived={isActived}>
        <Input
          value={textValue}
          mask={mask ? mask : []}
          onFocus={() => {
            // if (test) test();
            if (onFocus) onFocus();
          }}
          // onBlur={() => {
          //   if (setIsActived) setIsActived(false);
          // }}
          onChangeText={(text) => {
            if (onChangeText) onChangeText(text);
          }}
          inputAccessoryViewID={inputAccessoryViewID}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isShownPassword}
          readOnly={readOnly}
          onPressOut={onPressOut}
          textContentType={"oneTimeCode"}
          isActived={isActived}
          maxLength={maxLength ? maxLength : 300}
        />
        {secureTextEntry && (
          <EyesContainer
            onPress={() => setIsShownPassword(!isShownPassword)}
            activeOpacity={1}
          >
            <EyesSvg />
          </EyesContainer>
        )}
      </InputContainer>
      <InputAccessoryView nativeID={inputAccessoryViewID}>
        <KeyboardButtonContainer>
          <Button
            onPress={() => {
              console.log("gg>>>");
            }}
            title="확인"
          />
        </KeyboardButtonContainer>
      </InputAccessoryView>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const KeyboardButtonContainer = styled.View`
  flex: 1;
  padding-right: 16px;
  align-items: flex-end;
  background-color: ${colorSet.neutral.N1};
`;

const KeyboardButton = styled.TouchableOpacity`
  width: 100px;
  height: 100px;
  background-color: aqua;
  /* padding-right: 16px;
  align-items: flex-end;
  background-color: ${colorSet.neutral.N1}; */
`;

const InputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
  border-bottom-width: ${({ isActived }) => (isActived ? 1.6 : 0.75)};
  margin-bottom: ${({ isActived }) => (isActived ? 0 : 0.85)};
  border-color: ${({ isActived }) =>
    isActived ? colorSet.primary.P4_M : colorSet.neutral.N4};
`;

const Input = styled.TextInput`
  font-family: Pretendard-Regular;
  display: flex;
  flex: 1;
  color: ${({ isActived }) =>
    isActived ? colorSet.neutral.N7 : colorSet.neutral.N4};
  font-size: 17px;
  font-style: normal;
  font-weight: 400;
  line-height: 23px;
  letter-spacing: 0.425px;
`;

const EyesContainer = styled.TouchableOpacity``;

export default TextInputWithTitle;
