import React from 'react';
import { styled } from 'styled-components/native';
import LogoSvg from "../assets/home/logo.svg";
import MyPageSvg from "../assets/home/my-page.svg";
import ArrowDownSvg from "../assets/home/arrow-down.svg";
import EllipseSvg from "../assets/home/ellipse.svg";
import WhiteEllipseSvg from "../assets/home/white-ellipse.svg";
import MyGroupElement from '../components/home/MyGroupElement';
import EventElement from '../components/home/EventElement';

type Props = {};

const HomeScreen: React.FC<Props> = () => {
  return (
    <Container>
      <AvoidingView contentContainerStyle={{ gap: 32 }}>
        <HomeTopContainer>
          <Header>

            <LeftHeader>
              <LogoSvg/>
              <HeaderChurchText>번동제일 교회</HeaderChurchText>
              <HeaderChurchGroupText>청년 공동체</HeaderChurchGroupText>
            </LeftHeader>

            <RightHeader>
              <MyPageSvg/>
            </RightHeader>
            
          </Header>

          <Banner source={require("../assets/home/sample-banner.png")} >
            <BannerTextContainer>
              <BannerText>민영님, 안녕하세요!{"\n"}오늘은 어떤 하나님을 만나셨나요?</BannerText>
              <BannerVerse>하나님이여 사슴이 시냇물을 갈급함 같이 내 영혼이 주를 찾기에{"\n"}갈급하니이다. (시편 41:1-2)</BannerVerse>
            </BannerTextContainer>
          </Banner>

        </HomeTopContainer>

        <HomeBottomContainer>

          <MyGroupContainer>
            <MyGroupHeader>내 소그룹</MyGroupHeader>
            <MyGroupList horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <MyGroupElement imageUrl="../../assets/home/sample-group.png" peopleCount={12} place={"꿈의 교육관 1층"} title={"민영목장"} />
              <MyGroupElement imageUrl="../../assets/home/sample-group.png" peopleCount={6} place={"꿈의 교육관 2층"} title={"민영목장"} />
              <MyGroupElement imageUrl="../../assets/home/sample-group.png" peopleCount={4} place={"꿈의 교육관 3층"} title={"민영목장"} />
            </MyGroupList>
          </MyGroupContainer>

          <EventContainer>
            <EventHeader>
              <EventLeftHeader>
                <EventDate>23년 12월</EventDate>
                <ArrowDownSvg/>
              </EventLeftHeader>
              <EventRightHeader></EventRightHeader>
            </EventHeader>

            <EventListContainer>
              <EventList horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, width: "100%" }}>
                <EventVerticalView>
                  <EventElement imageUrl="../../assets/home/sample-user.png" userName="유민영"></EventElement>
                  <EventElement imageUrl="../../assets/home/sample-user.png" userName="유민영"></EventElement>
                  <EventElement imageUrl="../../assets/home/sample-user.png" userName="유민영"></EventElement>
                  <EventElement imageUrl="../../assets/home/sample-user.png" userName="유민영"></EventElement>
                  <EventElement imageUrl="../../assets/home/sample-user.png" userName="유민영"></EventElement>
                </EventVerticalView>
              </EventList>
              <EventPaging>
                <EllipseSvg/>
                <WhiteEllipseSvg/>
                <WhiteEllipseSvg/>
              </EventPaging>
            </EventListContainer>
          </EventContainer> 

        </HomeBottomContainer>
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
  background-color: white;
`;

const HomeTopContainer = styled.View`
  margin-top: 16px;
  gap: 8px;
`;

const Header = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 16px 0 16px;
`;

const LeftHeader = styled.View`
  flex: 5;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const HeaderChurchText = styled.Text`
  font-family: Pretendard-Medium;
  color: #20342F;
  font-size: 16px;
  font-weight: 700;
`;

const HeaderChurchGroupText = styled.Text`
  font-family: Pretendard-Medium;
  color: #20342F;
  font-size: 16px;
  font-weight: 400;
`;

const RightHeader = styled.View`
  flex: 1;
  flex-direction: row-reverse;
`;

const Banner = styled.ImageBackground`
  justify-content: space-between;
  padding: 16px;
  flex-direction: column-reverse;
  height: 200px;
`;

const BannerTextContainer = styled.View`
  gap: 12px;
`;

const BannerText = styled.Text`
  font-family: Pretendard-Medium;
  color: #313332;
  font-size: 20px;
  line-height: 20px;
  font-weight: 600;
`;

const BannerVerse = styled.Text`
  font-family: Pretendard-Medium;
  color: #20342F  ;
  font-size: 12px;
  line-height: 12px;
  font-weight: 300;
`;

const HomeBottomContainer = styled.View`
  gap: 32px;
`;

const MyGroupContainer = styled.View`
  display: flex;
  gap: 12px;
  padding: 0 16px 0 16px;
`;

const MyGroupHeader = styled.Text`
  font-family: Pretendard-Medium;
  color: #232323;
  font-size: 20px;
  line-height: 20px;
  font-weight: 700;
`;

const MyGroupList = styled.ScrollView`
  display: flex;
`;

const EventContainer = styled.View`
  display: flex;
  flex: 1;
  gap: 12px;
  padding: 0 16px 0 16px;
`;

const EventHeader = styled.View`
  display: flex;
  justify-content: space-between;
`;

const EventLeftHeader = styled.View`
   gap: 4px;
   flex-direction: row;
`;

const EventDate = styled.Text`
  font-family: Pretendard-Medium;
  color: #303030;
  font-size: 20px;
  font-weight: 700;
`;

const EventRightHeader = styled.View`
`;

const EventListContainer = styled.View`
  display: flex;
  gap: 16px;
  flex: 1;
  flex-direction: column;
`;

const EventList = styled.ScrollView`
  display: flex;
  flex: 1;
`;

const EventVerticalView = styled.View`
  flex-direction: column;
  flex: 1;
  gap: 8px;
`;

const EventPaging = styled.View`
  gap: 4px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export default HomeScreen;
