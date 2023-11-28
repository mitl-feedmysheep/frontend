import React, { useEffect, useMemo, useState } from "react";
import { styled } from "styled-components/native";
import Toast from "react-native-toast-message";
import { getStatusBarHeight } from "react-native-safearea-height";
import { Header, EmptyArea, Typo, Shadow } from "../components/common";
import { TextInputWithTitle } from "../components/text_input";
import { RoundButton, SmallRoundButton } from "../components/buttons";
import { colorSet } from "../constants";
import { CheckSelectionList } from "../components/list";

type Props = {};

type SignupFieldType =
  | "empty"
  | "name"
  | "birthday"
  | "phoneNumber"
  | "authenticationNumber"
  | "email"
  | "password"
  | "passwordCheck"
  | "address";

/*
  toast, validation, api 연동, 주소찾기, 디테일, 카카오맵 확인, 지라 티켓
*/

const ChurchRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [currentFieldType, setCurrentFieldType] =
    useState<SignupFieldType>("empty");
  const [church, setChurch] = useState("");
  const [selectedChurch, setSelectedChurch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [department, setDepartment] = useState("");
  const [isVisibleDepartment, setIsVisibleDepartment] = useState(false);
  const [churchList, setChurchList] = useState([]);

  useEffect(() => {
    if (selectedChurch) console.log("selectedChurch>>>", selectedChurch);
  }, [selectedChurch]);

  const isButtonActivated = useMemo(() => {
    if (selectedChurch && department) return true;
    // return false;
    return false;
  }, [selectedChurch, department]);

  const showToast = (text, type) => {
    Toast.show({
      type,
      props: { text },
      position: "top",
      topOffset: getStatusBarHeight() + 41,
    });
  };

  return (
    <Container>
      <HeaderContainer>
        <Header title="교회등록" isLeftButton />
      </HeaderContainer>
      <AvoidingView>
        <InnnerContainer>
          <EmptyArea height={40} />
          <InputContainer>
            <TextInputWithTitle
              title="교회"
              textValue={church}
              placeholder="번동제일교회"
              keyboardType="email-address"
              onChangeText={(text: string) => {
                setChurch(text);
              }}
              isActived={currentFieldType === "church"}
              onFocus={() => setCurrentFieldType("church")}
            />
            <EmptyArea width={10} />
            <SmallRoundButton
              onPress={() => {
                setCurrentFieldType("church");
                setSelectedChurch(null);
                setChurchList([
                  {
                    idx: 0,
                    title: "번동제일교회",
                    subTitle: "경기도 고양시 일산서구 일산로 612 50",
                    departments: [
                      {
                        idx: 0,
                        title: "청년부",
                      },
                      {
                        idx: 1,
                        title: "장년부",
                      },
                      {
                        idx: 2,
                        title: "유년부",
                      },
                      {
                        idx: 3,
                        title: "청소년부",
                      },
                    ],
                  },
                  {
                    idx: 1,
                    title: "번동제일교회",
                    subTitle: "경기도 고양시 일산서구 일산로 612 50",
                    departments: [
                      {
                        idx: 0,
                        title: "청년부",
                      },
                      {
                        idx: 1,
                        title: "장년부",
                      },
                      {
                        idx: 2,
                        title: "유년부",
                      },
                      {
                        idx: 3,
                        title: "청소년부",
                      },
                    ],
                  },
                ]);
              }}
              buttonText="검색"
              isActived={currentFieldType === "church"}
              buttonType="filled"
            />
          </InputContainer>
          <EmptyArea height={24} />
          {churchList.length > 0 && !selectedChurch && (
            <>
              <CheckSelectionList
                dataList={churchList}
                onPressSelection={(selectedChurch) => {
                  setChurch(selectedChurch.title);
                  setSelectedChurch(selectedChurch);
                  setCurrentFieldType("department");
                  setDepartment(null);
                  setIsVisibleDepartment(true);
                }}
              />
              <EmptyArea height={12} />
              <SmallRoundButton
                buttonText="교회 추가는 카카오톡 채널로 문의해주세요"
                isActived={false}
                buttonType="default"
              />
            </>
          )}
          <EmptyArea height={24} />
          <TextInputWithTitle
            title="부서"
            textValue={department}
            placeholder="부서를 선택해주세요!"
            keyboardType="numeric"
            onChangeText={(text: string) => {
              setDepartment(text);
            }}
            isActived={currentFieldType === "department"}
            onFocus={() => setCurrentFieldType("department")}
            // mask={
            //   [/\d/, /\d/, /\d/, /\d/, ".", /\d/, /\d/, ".", /\d/, /\d/]
            // }
            maxLength={8}
            onPressOut={() => {
              setIsVisibleDepartment(true);
              setCurrentFieldType("department");
            }}
            readOnly
          />
          <EmptyArea height={24} />
          {selectedChurch?.departments?.length > 0 && isVisibleDepartment && (
            <>
              <CheckSelectionList
                dataList={selectedChurch?.departments}
                onPressSelection={(selectedDepartment) => {
                  setDepartment(selectedDepartment?.title);
                  setIsVisibleDepartment(false);
                }}
              />
              <EmptyArea height={12} />
              <SmallRoundButton
                buttonText="교회 추가는 카카오톡 채널로 문의해주세요"
                isActived={false}
                buttonType="default"
              />
            </>
          )}
          <EmptyArea height={24} />
          <RoundButton
            buttonText="다음"
            isActived={isButtonActivated}
            onPress={() => {
              // showToast("토스트1", "successToast");
              // showToast("토스트2", "errorToast")
              navigation.replace("ChurchRegistrationComplete");
            }}
          />
        </InnnerContainer>
      </AvoidingView>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  display: flex;
  flex: 1;
  background-color: white;
`;

const AvoidingView = styled.ScrollView`
  display: flex;
  flex: 1;
`;

const HeaderContainer = styled.View`
  position: sticky;
`;

const InnnerContainer = styled.View`
  display: flex;
  margin-horizontal: 24px;
  flex: 1;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
`;

export default ChurchRegistrationScreen;
