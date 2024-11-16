import Header from '@components/common/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { styled } from 'styled-components/native';
import { RootStackParamList } from 'types/common';
import PencilSvg from '../../assets/buttons/pencil.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingHome'>;

const MeetingHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  // 임시 더미 데이터
  const members = Array(10).fill({
    id: 1,
    image: 'https://via.placeholder.com/50',
    isActive: true,
  });

  type MeetingItemProps = {
    order: number;
    date: string;
    dayOfWeek: string;
    prayCount: number;
    memberCount: number;
    location?: string;
    description?: string;
  };
  const meetings: MeetingItemProps[] = [
    {
      order: 6,
      date: '12일',
      dayOfWeek: '금요일',
      prayCount: 3,
      memberCount: 3,
      location: '꿈의 교육관 1층',
      description: '교리교육으로 목장모임 대체함',
    },
    // ... 다른 미팅 데이터
  ];

  const [cellName, setCellName] = useState('민영목장');
  const [cellMemberCount, setCellMemberCount] = useState(12);
  const [cellStartDate, setCellStartDate] = useState('2024.1.1');
  const [cellEndDate, setCellEndDate] = useState('2024.12.31');
  const [cellGatheringCount, setCellGatheringCount] = useState(12);
  const [cellPrayerRequestCount, setCellPrayerRequestCount] = useState(104);
  const [isCellLeader, setIsCellLeader] = useState(true);
  const [isMonthPickerModalVisible, setIsMonthPickerModalVisible] =
    useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <Container>
      <Header title={cellName} isLeftButton={true} />
      <InnerContainer>
        {/* 목장 멤버 리스트 */}
        <CellMemberListSection>
          <CellMemberInfo>
            {cellName} 멤버
            <HighLightText isHighlight fontWeight={500}>
              {' '}
              {cellMemberCount}
            </HighLightText>
          </CellMemberInfo>
          <CellMemberProfileList
            horizontal
            showsHorizontalScrollIndicator={false}>
            {members.map((member, index) => (
              <ProfileItem key={index}>
                <ProfileImage source={{ uri: member.image }} />
              </ProfileItem>
            ))}
          </CellMemberProfileList>
        </CellMemberListSection>

        {/* 날짜 & 셀 모임 간략화된 정보 */}
        <CellOverallInfoSection>
          <CellDateText>
            {cellStartDate} ~ {cellEndDate}
          </CellDateText>
          <CellGatheringInfoText>
            {cellGatheringCount + cellPrayerRequestCount > 0 ? (
              <>
                지금까지 총{' '}
                <HighLightText isHighlight>
                  {cellGatheringCount}번
                </HighLightText>
                의 모임과{' '}
                <HighLightText isHighlight>
                  {cellPrayerRequestCount}개
                </HighLightText>
                의{'\n'}기도제목이 쌓였어요!
              </>
            ) : (
              '아직 모임카드와 기도제목이 없군요!\n어서 첫 모임을 시작해보세요💪'
            )}
          </CellGatheringInfoText>
        </CellOverallInfoSection>

        {/* 모임 작성 및 리스트 */}
        <CellGatheringInfoSection>
          {/* 월 선택 */}
          <MonthHeader onPress={() => setIsMonthPickerModalVisible(true)}>
            <MonthTitle>
              {selectedYear.toString().slice(-2)}년 {selectedMonth}월
              {/* TODO: 드랍다운 아이콘 넣기 */}
            </MonthTitle>
            {/* TODO: 연필 아이콘 넣기 */}
          </MonthHeader>
          {/* TODO: 날짜 넣는 모달 넣기 */}
          {/* <MonthPickerModal
            visible={isMonthPickerModalVisible}
            onClose={() => setIsMonthPickerModalVisible(false)}
            onSelectMonth={handleMonthSelect}
            initialDate={new Date()}
          /> */}

          <CellGatheringInfo>
            {/* 모임 추가 칸 */}
            <AddMeetingButton>
              <IconWrapper>
                <PencilSvg />
              </IconWrapper>
              <AddMeetingText>모임 내용을 작성해주세요!</AddMeetingText>
            </AddMeetingButton>
            {/* 모임 리스트 */}
            <MeetingItem>
              <MeetingMain>
                <OrderText>6번째 모임</OrderText>
                <DateText>12일 금요일</DateText>
              </MeetingMain>
              <MeetingDivider />
              <MeetingInfo>
                <MeetingStats>
                  <StatItem>+3</StatItem>
                  <StatItem>3</StatItem>
                  <LocationText>꿈의 교육관 1층</LocationText>
                </MeetingStats>
                <MeetingDescription>
                  교리교육으로 목장모임 대체함
                </MeetingDescription>
              </MeetingInfo>
            </MeetingItem>
          </CellGatheringInfo>
        </CellGatheringInfoSection>
      </InnerContainer>
    </Container>
  );
};

const IconWrapper = styled.View`
  margin-right: 4px;
`;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const InnerContainer = styled.ScrollView`
  flex: 1;
`;

const CellMemberListSection = styled.View`
  padding-top: 12px;
  padding-left: 16px;
`;

type StyledTextProps = {
  isHighlight?: boolean;
  fontWeight?: number;
};

const HighLightText = styled.Text<StyledTextProps>`
  color: ${({ isHighlight }) => (isHighlight ? '#389629' : '#313331')};
  font-weight: ${({ fontWeight }) => fontWeight || 500};
`;

const CellMemberInfo = styled.Text`
  font-size: 14px;
  color: #313331;
  margin-bottom: 8px;
  font-weight: 400;
`;

const CellMemberProfileList = styled.ScrollView``;

const ProfileItem = styled.View`
  margin-right: 8px;
  position: relative;
`;

const ProfileImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #ebefd4;
`;

const CellOverallInfoSection = styled.View`
  padding-top: 22px;
  padding-left: 16px;
  padding-right: 16px;
`;

const CellDateText = styled.Text`
  font-size: 12px;
  color: #709180;
`;

const CellGatheringInfoText = styled.Text`
  padding-top: 4px;
  font-size: 20px;
  font-weight: 600;
  color: #313331;
  line-height: 22px;
  letter-spacing: -0.4px;
`;

const CellGatheringInfoSection = styled.View`
  padding-top: 26px;
  padding-left: 16px;
  padding-right: 16px;
`;

const MonthHeader = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const MonthTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #313331;
`;

const EditButton = styled.TouchableOpacity``;

const AddMeetingButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  border-width: 1.5px;
  border-style: dashed;
  border-color: #c2d0c9;
  border-radius: 16px;
  background-color: #f5f7f5;
  margin: 8px 0;
  width: 100%;
  min-height: 69;
`;

const AddMeetingText = styled.Text`
  color: #a5baaf;
  font-size: 14px;
`;

const CellGatheringInfo = styled.View`
  padding-top: 8px;
`;

const MeetingItem = styled.View`
  flex-direction: row;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 8px;
  margin-top: 8px;
`;

const MeetingMain = styled.View`
  flex: 1;
`;

const OrderText = styled.Text`
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
`;

const DateText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #313331;
`;

const MeetingDivider = styled.View`
  width: 1px;
  background-color: #eeeeee;
  margin: 0 16px;
`;

const MeetingInfo = styled.View`
  flex: 2;
`;

const MeetingStats = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const StatItem = styled.Text`
  font-size: 14px;
  color: #313331;
  margin-right: 8px;
`;

const LocationText = styled.Text`
  font-size: 14px;
  color: #313331;
`;

const MeetingDescription = styled.Text`
  font-size: 14px;
  color: #666666;
`;

export default MeetingHomeScreen;
