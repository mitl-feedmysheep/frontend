import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { styled } from "styled-components/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국 지역 불러오기
dayjs.locale("ko"); // 한국 지역 설정

import { EmptyArea, Header } from "../../components/common";
import CalenderIcon from "../../assets/icon/ic_calendar_line.svg";
import MapIcon from "../../assets/icon/ic_map_line.svg";
import TimeIcon from "../../assets/icon/ic_time_line.svg";
import StarIcon from "../../assets/icon/ic_star_line.svg";
import DashedLine from "../../assets/lines/dashed_line.svg";
import CloseCircle from "../../assets/icon/ic_close_circle_fill.svg";
import EditIcon from "../../assets/icon/ic_edit_line.svg";
import DeleteIcon from "../../assets/icon/ic_delete_bin_line.svg";
import { MainButton } from "../../components/buttons";
import { CellMemberCard } from "../../components/items";
import { delay } from "../../utils/utils";
import {
  MeetingDetailsScreenStep,
  RootStackParamList,
} from "../../types/common";

type Props = NativeStackScreenProps<RootStackParamList, "MeetingDetails">;

interface IconItemProps {
  icon: React.ReactElement;
  text: string;
  onPress?: () => void;
  type?: "textinput" | "touchable";
  placeholder?: string;
  setValue?: (value: string) => void;
  editable?: boolean;
}

interface CellMember {
  idx: number;
  name: string;
  date?: Date;
  worship: boolean;
  meeting: boolean;
  nanum: string;
  prayerTopics: string[];
}

const cellMembersData: CellMember[] = [
  {
    idx: 0,
    name: "유민영",
    worship: false,
    meeting: false,
    nanum: "",
    prayerTopics: [""],
  },
  {
    idx: 1,
    name: "김창수",
    worship: false,
    meeting: false,
    nanum: "",
    prayerTopics: [""],
  },
  {
    idx: 2,
    name: "유민영",
    worship: false,
    meeting: false,
    nanum: "",
    prayerTopics: [""],
  },
  {
    idx: 3,
    name: "김창수",
    worship: false,
    meeting: false,
    nanum: "",
    prayerTopics: [""],
  },
  {
    idx: 4,
    name: "유민영",
    worship: false,
    meeting: false,
    nanum: "",
    prayerTopics: [""],
  },
  {
    idx: 5,
    name: "김창수",
    worship: false,
    meeting: false,
    nanum: "",
    prayerTopics: [""],
  },
];

const MeetingDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [screenType, setScreenType] = useState<MeetingDetailsScreenStep>(
    route.params?.passedScreenType ? route.params.passedScreenType : "view"
  );
  const [date, setDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [meetingTime, setMeetingTime] = useState(
    "오후 2시 15분 ~ 오후 3시 15분"
  );
  const [meetingMemo, setMeetingMemo] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [cellMembers, setCellMembers] = useState<CellMember[]>(cellMembersData);
  const [readonly, setReadonly] = useState(
    route.params?.passedScreenType === "view" ? true : false
  );

  const showDatePicker = () => {
    setPickerMode("date");
    setDatePickerVisibility(true);
  };

  const showTimePicker = () => {
    setPickerMode("time");
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    hideDatePicker();
    setDate(date);
  };

  const scrollToPosition = () => {
    // 특정 위치로 스크롤 이동
    scrollViewRef.current?.scrollTo({ x: 0, y: 138, animated: true });
  };

  const onPressCTAButton = async () => {
    switch (screenType) {
      case "view":
        setReadonly(true);
        break;
      case "infomation":
        setScreenType("pray");
        setCellMembers(cellMembers.map((item) => ({ ...item, date })));
        await delay(100);
        scrollToPosition();
        break;
      case "pray":
        navigation.navigate("MeetingComplete");
        break;
    }
  };

  const isButtonActived = useMemo(() => {
    // return true;
    return (
      meetingDate.length > 0 &&
      meetingPlace.length > 0 &&
      meetingTime.length > 0 &&
      meetingMemo.length > 0
    );
  }, [meetingDate, meetingPlace, meetingTime, meetingMemo]);

  useEffect(() => {
    if (date) {
      setMeetingDate(dayjs(date).format("YYYY년 MM월 DD일 ddd요일"));
      const hour = dayjs(date).hour();
      const minute = dayjs(date).minute();
      const formattedTime =
        hour >= 12
          ? `오후 ${hour - 12}시 ${minute}분`
          : `오전 ${hour}시 ${minute}분`;

      const newDate = dayjs(date).add(1, "hour");
      const newHour = dayjs(newDate).hour();
      const newMinute = dayjs(newDate).minute();
      const newFormattedTime =
        newHour >= 12
          ? `오후 ${newHour - 12}시 ${newMinute}분`
          : `오전 ${newHour}시 ${newMinute}분`;
      setMeetingTime(`${formattedTime} ~ ${newFormattedTime}`);
    }
  }, [date]);

  const itemList: IconItemProps[] = [
    {
      icon: <CalenderIcon />,
      text: meetingDate,
      onPress: () => showDatePicker(),
      type: "touchable",
    },
    {
      icon: <MapIcon />,
      text: meetingPlace,
      type: "textinput",
      placeholder: "모임 장소",
      setValue: (value) => setMeetingPlace(value),
    },
    {
      icon: <TimeIcon />,
      text: meetingTime,
      onPress: () => showTimePicker(),
      type: "touchable",
    },
    {
      icon: <StarIcon />,
      text: meetingMemo,
      type: "textinput",
      placeholder: "특이사항",
      setValue: (value) => setMeetingMemo(value),
    },
  ];

  return (
    <Container>
      <HeaderContainer>
        <Header title="모임 내용" isLeftButton />
        {readonly && screenType === "view" && (
          <HeaderButtonContainer>
            <EditButton activeOpacity={1} onPress={() => setReadonly(false)}>
              <EditIcon />
            </EditButton>
            <DeleteButton activeOpacity={1}>
              <DeleteIcon />
            </DeleteButton>
          </HeaderButtonContainer>
        )}
      </HeaderContainer>
      <AvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <InnnerContainer ref={scrollViewRef}>
            <EmptyArea height={4} />
            {itemList.map((item, index) => (
              <>
                <IconItem {...item} editable={!readonly} />
                {index < itemList.length - 1 && <DashedLine />}
              </>
            ))}
            {(screenType === "pray" || screenType === "view") && (
              <>
                <EmptyArea height={20} />
                <WrittingText>오늘의 기록</WrittingText>
                {cellMembers?.length > 0 && (
                  <CellMemberCardListContainer>
                    {cellMembers.map((cellMember) => (
                      <CellMemberCard
                        name={cellMember.name}
                        date={cellMember.date}
                        worship={cellMember.worship}
                        meeting={cellMember.meeting}
                        setWorship={() =>
                          setCellMembers(
                            cellMembers.map((member) =>
                              member.idx === cellMember.idx
                                ? { ...member, worship: !member.worship }
                                : member
                            )
                          )
                        }
                        setMeeting={() =>
                          setCellMembers(
                            cellMembers.map((member) =>
                              member.idx === cellMember.idx
                                ? { ...member, meeting: !member.meeting }
                                : member
                            )
                          )
                        }
                        meetingText={cellMember.nanum}
                        prayerList={cellMember.prayerTopics}
                        setMeetingText={(text) =>
                          setCellMembers(
                            cellMembers.map((member) =>
                              member.idx === cellMember.idx
                                ? { ...member, nanum: text }
                                : member
                            )
                          )
                        }
                        setPrayerText={(text, index) =>
                          setCellMembers(
                            cellMembers.map((member) =>
                              member.idx === cellMember.idx
                                ? {
                                    ...member,
                                    prayerTopics: member.prayerTopics.map(
                                      (prayer, idx) =>
                                        idx === index ? text : prayer
                                    ),
                                  }
                                : member
                            )
                          )
                        }
                        addPrayer={() =>
                          setCellMembers(
                            cellMembers.map((member) =>
                              member.idx === cellMember.idx
                                ? {
                                    ...member,
                                    prayerTopics:
                                      member.prayerTopics.concat(""),
                                  }
                                : member
                            )
                          )
                        }
                        onSave={(props) => {
                          props.callbackSuccess();
                        }}
                        readonly={readonly}
                      />
                    ))}
                  </CellMemberCardListContainer>
                )}
              </>
            )}
          </InnnerContainer>
        </TouchableWithoutFeedback>
      </AvoidingView>
      {!readonly && (
        <CTAContainer>
          <MainButton
            buttonText={screenType === "infomation" ? "다음" : "작성 완료"}
            isActived={isButtonActived}
            activeType="active"
            onPress={onPressCTAButton}
          />
        </CTAContainer>
      )}
      <DateTimePickerModal
        locale="ko"
        isVisible={isDatePickerVisible}
        date={date}
        mode={pickerMode}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
    </Container>
  );
};

const IconItem = ({
  icon,
  text,
  onPress,
  type = "touchable",
  placeholder,
  setValue,
  editable,
}: IconItemProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  const item =
    type === "touchable" ? (
      <TouchableItemArea
        activeOpacity={1}
        onPress={editable ? onPress : () => {}}
      >
        <ItemText>{text}</ItemText>
      </TouchableItemArea>
    ) : (
      <>
        <TextInputItemArea
          value={text}
          onChangeText={(text) => {
            if (setValue) setValue(text);
          }}
          placeholder={placeholder}
          placeholderTextColor="#A5BAAF"
          onFocus={onFocus}
          onBlur={onBlur}
          editable={editable}
          ref={inputRef}
        />
        <EmptyArea width={2} />
        {text.length > 0 && isFocused && (
          <CloseCircleButton
            onPress={() => (setValue ? setValue("") : {})}
            activeOpacity={1}
          >
            <CloseCircle />
          </CloseCircleButton>
        )}
      </>
    );

  return (
    <IconItemContainer>
      {icon}
      <EmptyArea width={8} />
      {item}
    </IconItemContainer>
  );
};

const Container = styled.SafeAreaView`
  display: flex;
  flex: 1;
  background-color: white;
`;

const HeaderContainer = styled.View`
  position: relative;
`;

const HeaderButtonContainer = styled.View`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-16px);
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const EditButton = styled.TouchableOpacity``;

const DeleteButton = styled.TouchableOpacity``;

const AvoidingView = styled.KeyboardAvoidingView`
  display: flex;
  flex: 1;
`;

const InnnerContainer = styled.ScrollView`
  display: flex;
  flex: 1;
  margin-horizontal: 20px;
`;

const IconItemContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 12px;
  /* background-color: gray; */
`;

const CellMemberCardListContainer = styled.View`
  display: flex;
  gap: 16px;
`;

const TouchableItemArea = styled.TouchableOpacity`
  flex: 1;
  padding-vertical: 4px;
`;

const CloseCircleButton = styled.TouchableOpacity``;

const TextInputItemArea = styled.TextInput`
  flex: 1;
  padding-vertical: 4px;
  color: #405347;
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const ItemText = styled.Text`
  color: #405347;
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const CTAContainer = styled.View`
  padding-horizontal: 16px;
  height: 66px;
  align-items: center;
  justify-content: center;
`;

const WrittingText = styled.Text`
  padding: 16px 0px;
  font-family: Pretendard-Regular;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 26px;
  color: #232323;
  text-align: left;
`;

export default MeetingDetailsScreen;
