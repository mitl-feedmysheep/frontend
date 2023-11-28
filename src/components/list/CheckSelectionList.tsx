import React, { useState } from "react";
import { styled } from "styled-components/native";
import RadioGroup from "react-native-radio-buttons-group";
import { Typo } from "../common";
import { colorSet } from "../../constants";
import { SmallRoundButton } from "../buttons";

type Props = {
  dataList: Array<any>;
  onPressSelection: () => {};
};

const CheckSelectionList: React.FC<Props> = ({
  dataList,
  onPressSelection,
}) => {
  const [newDataList, setNewDataList] = useState(
    dataList.map((item, index) =>
      index === 0 ? { ...item, isChecked: true } : { ...item, isChecked: false }
    )
  );

  const onPressRadioButton = (idx) => {
    setNewDataList(
      newDataList.map((item) =>
        item.idx === idx
          ? { ...item, isChecked: true }
          : { ...item, isChecked: false }
      )
    );
  };
  const CheckItem = ({ item, onPressRadioButton }) => {
    const { title, subTitle, isChecked, idx } = item;
    return (
      <CheckItemContainer>
        <CheckBoxContainer>
          <CheckBox
            onPress={() => onPressRadioButton(idx)}
            activeOpacity={1}
            isChecked={isChecked}
          >
            {isChecked && <Dot />}
          </CheckBox>
        </CheckBoxContainer>
        <TextContainer>
          <Typo type="B2" color={colorSet.neutral.N5}>
            {title}
          </Typo>
          {subTitle && (
            <Typo type="actionBar" color={colorSet.neutral.N5}>
              {subTitle}
            </Typo>
          )}
        </TextContainer>
        {isChecked && (
          <SmallRoundButton
            onPress={() =>
              onPressSelection(dataList.find((item) => item.idx === idx))
            }
            buttonText="선택"
            buttonType="filled"
          />
        )}
      </CheckItemContainer>
    );
  };
  return (
    <Container>
      {newDataList.map((item, index) => (
        <>
          <Divider />
          <CheckItem item={item} onPressRadioButton={onPressRadioButton} />
          {newDataList?.length - 1 === index && <Divider />}
        </>
      ))}
    </Container>
  );
};

const Container = styled.View``;
const CheckBoxContainer = styled.View`
  padding: 10px;
`;

const CheckBox = styled.TouchableOpacity`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border-width: 1.5px;
  border-color: ${({ isChecked }) =>
    isChecked ? colorSet.primary.P4_M : colorSet.neutral.N5};
  align-items: center;
  justify-content: center;
`;

const Dot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${colorSet.primary.P4_M};
`;

const TextContainer = styled.View`
  display: flex;
  flex: 1;
`;

const CheckItemContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 16px;
`;

const Divider = styled.View`
  display: flex;
  flex: 1;
  height: ${({ height }) => (height ? height : 0.75)};
  background-color: ${({ color }) => (color ? color : colorSet.neutral.N4)};
`;

export default CheckSelectionList;
