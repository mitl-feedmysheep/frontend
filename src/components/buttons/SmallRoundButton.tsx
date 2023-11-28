import React, { useMemo } from "react";
import { styled } from "styled-components/native";
import { colorSet } from "../../constants";
import { Shadow, Typo } from "../common";

type Props = {
  width?: number;
  buttonText: string;
  buttonType: "default" | "filled" | "complete";
  isActived?: boolean;
  isDisabled?: boolean;
  onPress?: () => {};
};

const SmallRoundButton: React.FC<Props> = ({
  width,
  buttonText,
  buttonType = "default",
  isActived = true,
  isDisabled = false,
  onPress,
}) => {
  const buttonColorSet = useMemo(() => {
    switch (buttonType) {
      case "default":
        return {
          activatedBorderColor: colorSet.primary.P4_M,
          inactivatedBorderColor: colorSet.neutral.N4,
          activatedTextColor: colorSet.neutral.N7,
          inactivatedTextColor: colorSet.neutral.N4,
          activatedBackgroundColor: "white",
          inactivatedBackgroundColor: "white",
        };
      case "filled":
        return {
          activatedBorderColor: colorSet.primary.P4_M,
          inactivatedBorderColor: colorSet.neutral.N4,
          activatedTextColor: colorSet.neutral.N1,
          inactivatedTextColor: colorSet.neutral.N1,
          activatedBackgroundColor: colorSet.primary.P4_M,
          inactivatedBackgroundColor: colorSet.neutral.N4,
        };
      case "complete":
        return {
          activatedBorderColor: colorSet.primary.P2,
          inactivatedBorderColor: colorSet.neutral.N4,
          activatedTextColor: colorSet.primary.P6,
          inactivatedTextColor: colorSet.neutral.N1,
          activatedBackgroundColor: colorSet.primary.P2,
          inactivatedBackgroundColor: colorSet.neutral.N4,
        };
    }
  }, [buttonType]);

  const onPressButton = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };
  return (
    <Button
      onPress={onPressButton}
      activeOpacity={1}
      buttonColorSet={buttonColorSet}
      isActived={isActived}
      width={width}
    >
      <Typo
        size="small"
        type="actionBar"
        color={
          isActived
            ? buttonColorSet.activatedTextColor
            : buttonColorSet.inactivatedTextColor
        }
      >
        {buttonText}
      </Typo>
    </Button>
  );
};

const Button = styled.TouchableOpacity`
  padding: 6px 18px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 0.75px;
  border-color: ${({ buttonColorSet, isActived }) => {
    const { activatedBorderColor, inactivatedBorderColor } = buttonColorSet;
    if (isActived) return activatedBorderColor;
    else return inactivatedBorderColor;
  }};
  background-color: ${({ buttonColorSet, isActived }) => {
    const { activatedBackgroundColor, inactivatedBackgroundColor } =
      buttonColorSet;
    if (isActived) return activatedBackgroundColor;
    else return inactivatedBackgroundColor;
  }};
`;

// const ButtonText = styled(Typo)`
//   color: ${({ buttonColorSet, isActived }) => {
//     const { activatedTextColor, inactivatedTextColor } = buttonColorSet;
//     if (isActived) return activatedTextColor;
//     else return inactivatedTextColor;
//   }};
// `;

export default SmallRoundButton;
