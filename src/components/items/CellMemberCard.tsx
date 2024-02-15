import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components/native";
import { CheckBox, CheckBoxWithLabel, EmptyArea, Profile } from "../common";
import DashedLine from "../../assets/lines/dashed_line.svg";
import AddIcon from "../../assets/icon/ic_add_line.svg";
import CloseCircle from "../../assets/icon/ic_close_circle_fill.svg";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국 지역 불러오기
import { MainButton } from "../buttons";
import { Keyboard, TextInputProps } from "react-native";
dayjs.locale("ko"); // 한국 지역 설정

interface OnSaveProps {
  callbackSuccess: () => void;
}

interface Props {
  name: string;
  date?: Date;
  worship: boolean;
  meeting: boolean;
  setWorship?: () => void;
  setMeeting?: () => void;
  meetingText: string;
  prayerList: string[];
  setMeetingText?: (text: string) => void;
  setPrayerText?: (text: string, index: number) => void;
  addPrayer?: () => void;
  onSave?: (props: OnSaveProps) => void;
  readonly?: boolean;
}

const CellMemberCard: React.FC<Props> = ({
  name,
  date,
  worship = false,
  meeting = false,
  setWorship = () => {},
  setMeeting = () => {},
  meetingText = "",
  prayerList = [""],
  setMeetingText = () => {},
  setPrayerText = () => {},
  addPrayer = () => {},
  onSave = () => {},
  readonly = false,
}) => {
  const [isEdited, setIsEdited] = useState(false);
  const nanumInputRef = useRef(null);
  const prayerInputRef = useRef(null);

  useEffect(() => {
    if (meeting && nanumInputRef.current) {
      nanumInputRef.current.focus();
    }
  }, [meeting]);

  useEffect(() => {
    if (prayerInputRef.current) {
      prayerInputRef.current.focus();
    }
  }, [prayerList]);

  return (
    <Container>
      <InfoContainer>
        <LeftContainer>
          <Profile />
          <EmptyArea width={8} />
          <TextContainer>
            <NameText>{name}</NameText>
            <EmptyArea height={2} />
            {date && (
              <MeetingDateText>
                {dayjs(date).format("YYYY.MM.DD")}
              </MeetingDateText>
            )}
          </TextContainer>
        </LeftContainer>
        <RightContainer>
          <CheckBoxWithLabel
            label="예배"
            isChecked={worship}
            setIsChecked={setWorship}
            disabled={readonly}
          />
          <EmptyArea width={12} />
          <CheckBoxWithLabel
            label="모임"
            isChecked={meeting}
            setIsChecked={setMeeting}
            disabled={readonly}
          />
        </RightContainer>
      </InfoContainer>
      {meeting && (
        <InputContainer>
          <EmptyArea height={24} />
          <InputTitle>나눔</InputTitle>
          <EmptyArea height={8} />
          <MeetingTextInput
            value={meetingText}
            onChangeText={(text) => {
              setIsEdited(true);
              setMeetingText(text);
            }}
            editable={!readonly}
            placeholder="나눔 내용을 적어주세요."
            inputRef={nanumInputRef}
          />
          <EmptyArea height={16} />
          <DashedLine />
          <EmptyArea height={16} />
          <PrayerTitleContainer>
            <InputTitle>기도제목</InputTitle>
            {!readonly && (
              <AddIconButton
                onPress={() => {
                  setIsEdited(true);
                  addPrayer();
                }}
                activeOpacity={1}
              >
                <AddIcon />
              </AddIconButton>
            )}
          </PrayerTitleContainer>
          <EmptyArea height={8} />
          <PrayerListContainer>
            {prayerList?.map((prayer, index) => (
              <MeetingTextInput
                value={prayer}
                onChangeText={(text) => {
                  setIsEdited(true);
                  setPrayerText(text, index);
                }}
                editable={!readonly}
                placeholder="기도제목을 적어주세요."
                inputRef={prayerInputRef}
              />
            ))}
          </PrayerListContainer>
          {isEdited && !readonly && (
            <SaveButtonContainer>
              <EmptyArea height={24} />
              <MainButton
                buttonText="저장"
                isActived={true}
                activeType="active"
                onPress={() =>
                  onSave({ callbackSuccess: () => setIsEdited(false) })
                }
              />
            </SaveButtonContainer>
          )}
        </InputContainer>
      )}
    </Container>
  );
};

const MeetingTextInput = ({
  value,
  onChangeText,
  editable,
  placeholder,
  inputRef,
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  // const inputRef = useRef(null);

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  return (
    <TextInputContainer>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        scrollEnabled={false}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor="#A5BAAF"
        onFocus={onFocus}
        onBlur={onBlur}
        ref={inputRef}
      />
      {value && value.length > 0 && isFocused && (
        <CloseCircleButton
          onPress={() => {
            if (onChangeText) onChangeText("");
          }}
          activeOpacity={1}
        >
          <CloseCircle />
        </CloseCircleButton>
      )}
    </TextInputContainer>
  );
};

const Container = styled.View`
  display: flex;
  padding: 16px;
  border-radius: 16px;
  background-color: #f5f7f5;
`;

const InfoContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const InputContainer = styled.View`
  display: flex;
`;

const PrayerListContainer = styled.View`
  gap: 8px;
`;

const PrayerTitleContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 24px;
  justify-content: space-between;
`;

const LeftContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

const RightContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

const TextContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

const NameText = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  color: #20342f;
  text-align: center;
`;

const MeetingDateText = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: #709180;
  text-align: left;
`;

const InputTitle = styled.Text`
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  color: #5f7b6d;
  text-align: left;
`;

const AddIconButton = styled.TouchableOpacity``;

const TextInput = styled.TextInput`
  display: flex;
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  color: #405347;
  background-color: #fefffe;
`;

const SaveButtonContainer = styled.View``;

const CloseCircleButton = styled.TouchableOpacity`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-8px);
`;

const TextInputContainer = styled.View`
  flex-direction: row;
  position: relative;
`;

export default CellMemberCard;
