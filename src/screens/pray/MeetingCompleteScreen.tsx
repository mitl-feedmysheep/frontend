import React from "react";
import { styled } from "styled-components/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/common";
import { MainButton } from "../../components/buttons";
import { EmptyArea } from "../../components/common";

type Props = NativeStackScreenProps<RootStackParamList, "MeetingComplete">;

const MeetingCompleteScreen: React.FC<Props> = ({ navigation, route }) => {
  return (
    <Container>
      <BodyContainer>
        <CompleteText>작성 완료!</CompleteText>
        <EmptyArea height={12} />
        <RowContainer>
          <DescriptionNormalText>오늘 총 </DescriptionNormalText>
          <DescriptionBoldWrapper>
            <DescriptionBoldText>2시간 30분</DescriptionBoldText>
            <DescriptionUnderline />
          </DescriptionBoldWrapper>
          <DescriptionNormalText>동안 나눔을 했고,</DescriptionNormalText>
        </RowContainer>
        <RowContainer>
          <DescriptionNormalText>총 </DescriptionNormalText>
          <DescriptionBoldWrapper>
            <DescriptionBoldText>12개</DescriptionBoldText>
            <DescriptionUnderline />
          </DescriptionBoldWrapper>
          <DescriptionNormalText>의 기도제목이 쌓였어요!</DescriptionNormalText>
        </RowContainer>
      </BodyContainer>
      <CTAButtonContainer>
        <MainButton
          buttonText="완료"
          isActived
          activeType="active"
          onPress={() => {}}
        />
      </CTAButtonContainer>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  display: flex;
  flex: 1;
  background-color: white;
`;

const BodyContainer = styled.View`
  display: flex;
  flex: 1%;
  align-items: center;
  justify-content: center;
`;

const RowContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

const CTAButtonContainer = styled.View`
  padding-horizontal: 16px;
  height: 66px;
  align-items: center;
  justify-content: center;
`;

const CompleteText = styled.Text`
  color: #252625;
  font-family: Pretendard-SemiBold;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const DescriptionNormalText = styled.Text`
  color: #636663;
  font-family: Pretendard-Regular;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const DescriptionBoldWrapper = styled.View`
  position: relative;
  /* opacity: 0.2; */
  /* height: 24px; */
  /* border-bottom-width: 8px;
  border-color: rgba(165, 186, 175, 0.2); */
`;

const DescriptionUnderline = styled.View`
  position: absolute;
  display: flex;
  flex: 1;
  bottom: -1px;
  height: 8px;
  width: 100%;
  background-color: rgba(165, 186, 175, 0.2);
`;

const DescriptionBoldText = styled.Text`
  color: #5f7b6d;
  font-family: Pretendard-Bold;
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
`;

export default MeetingCompleteScreen;
