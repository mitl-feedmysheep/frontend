import Header from '@components/common/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { styled } from 'styled-components/native';
import { RootStackParamList } from 'types/common';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingHome'>;

const MeetingHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  // 임시 더미 데이터
  const members = Array(7).fill({
    id: 1,
    image: 'https://via.placeholder.com/50',
    isActive: true,
  });

  const [cellName, setCellName] = useState('민영목장');
  const [cellMemberCount, setCellMemberCount] = useState(12);

  return (
    <Container>
      <Header title={cellName} isLeftButton={true} />
      <InnerContainer>
        <ProfileSection>
          <ProfileCount>
            {cellName} 멤버 {cellMemberCount}
          </ProfileCount>
          <ProfileList horizontal showsHorizontalScrollIndicator={false}>
            {members.map((member, index) => (
              <ProfileItem key={index}>
                <ProfileImage source={{ uri: member.image }} />
                {member.isActive && <ActiveIndicator />}
              </ProfileItem>
            ))}
          </ProfileList>

          <DateText>2022.11 - 2023.12.31</DateText>
          <MessageText>
            아직 모임카드와 기도제목이 없군요!{'\n'}어서 첫 모임을
            시작해보세요💪
          </MessageText>
        </ProfileSection>

        <MonthSection>
          <MonthHeader>
            <MonthTitle>22년 10월</MonthTitle>
            <EditButton>{/* EditIcon 컴포넌트 필요 */}</EditButton>
          </MonthHeader>

          <AddMemoButton>
            {/* PlusIcon 컴포넌트 필요 */}
            <AddMemoText>모임 내용을 작성해주세요!</AddMemoText>
          </AddMemoButton>
        </MonthSection>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const InnerContainer = styled.ScrollView`
  flex: 1;
`;

const ProfileSection = styled.View`
  padding: 20px;
`;

const ProfileCount = styled.Text`
  font-size: 14px;
  color: #313331;
  margin-bottom: 10px;
`;

const ProfileList = styled.ScrollView`
  margin-bottom: 15px;
`;

const ProfileItem = styled.View`
  margin-right: 10px;
  position: relative;
`;

const ProfileImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #f0f0f0;
`;

const ActiveIndicator = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #4caf50;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const DateText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const MessageText = styled.Text`
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
  line-height: 24px;
`;

const MonthSection = styled.View`
  margin-top: 10px;
`;

const MonthHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
`;

const MonthTitle = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const EditButton = styled.TouchableOpacity`
  padding: 5px;
`;

const AddMemoButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  margin: 0 15px;
`;

const AddMemoText = styled.Text`
  color: #666;
  margin-left: 10px;
`;

export default MeetingHomeScreen;
