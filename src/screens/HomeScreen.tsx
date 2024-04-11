import React, { useEffect, useState } from "react";
import { styled } from "styled-components/native";
import LogoSvg from "../assets/home/logo.svg";
import MyPageSvg from "../assets/home/my-page.svg";
import ArrowDownSvg from "../assets/home/arrow-down.svg";
import EllipseSvg from "../assets/home/ellipse.svg";
import WhiteEllipseSvg from "../assets/home/white-ellipse.svg";
import MyGroupElement from "../components/home/MyGroupElement";
import EventElement from "../components/home/EventElement";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getAppMediaList,
  getAppText,
  getAppWords,
  getChurchEventList,
  getUserCellList,
  getUserChurchList,
  getUserInfo,
} from "../utils/apis";

type Props = {};

const HomeScreen: React.FC<Props> = () => {
  const [churchName, setChurchName] = useState<string>("");
  const [bodyName, setBodyName] = useState<string>("");
  const [userImageUrl, setUserImageUrl] = useState<string>("");
  const [bannerImageUrl, setBannerImageUrl] = useState<string>("");
  const [bannerText, setBannerText] = useState<string>("");
  const [bannerWords, setBannerWords] = useState<string>("");
  const [myGroupElements, setMyGroupElements] = useState<any[]>([]);
  const [calendarYear, setCalendarYear] = useState<string>("");
  const [calendarMonth, setCalendarMonth] = useState<string>("");
  const [eventElements, setEventElements] = useState<any[]>([]);
  const [eventPageCount, setEventPageCount] = useState<number>(1);
  const [currentEventPage, setCurrentEventPage] = useState<number>(0);

  const [bodyId, setBodyId] = useState(0);

  const { data: churchListData } = useQuery({
    queryKey: ["churchList"],
    queryFn: () => getUserChurchList(),
  });

  const [
    { data: userData },
    { data: bannerImageData },
    { data: bannerTextData },
    { data: bannerWordsData },
  ] = useQueries({
    queries: [
      { queryKey: ["userInfo"], queryFn: () => getUserInfo() },
      {
        queryKey: ["bannerImage"],
        queryFn: () => getAppMediaList("home-on-top-of-cell-list"),
      },
      {
        queryKey: ["bannerText"],
        queryFn: () => getAppText("home-on-top-of-cell-list"),
      },
      {
        queryKey: ["bannerWords"],
        queryFn: () => getAppWords("home-on-top-of-cell-list"),
      },
    ],
  });

  const { data: cellListData } = useQuery({
    queryKey: ["cellList"],
    queryFn: () => getUserCellList(bodyId),
    enabled: !!bodyId,
  });

  const { data: eventListData } = useQuery({
    queryKey: ["eventList"],
    queryFn: () => getChurchEventList(bodyId, calendarYear, calendarMonth, 0),
    enabled: !!bodyId,
  });

  useEffect(() => {
    if (churchListData?.data) {
      console.log("churchListData>>>", churchListData.data);
      const defaultData = churchListData.data;
      setChurchName(defaultData?.churchName ?? "교회");
      setBodyName(defaultData?.bodyList[0].bodyName ?? "공동체");
      setBodyId(defaultData?.bodyList[0].bodyId ?? 0);
    }
  }, [churchListData]);

  useEffect(() => {
    if (userData?.data?.profileImageUrl) {
      setUserImageUrl(userData?.data?.profileImageUrl);
    }
  }, [userData]);

  useEffect(() => {
    if (
      bannerImageData?.data?.length > 0 &&
      bannerImageData.data[0]?.mediaUrl
    ) {
      setBannerImageUrl(bannerImageData.data[0].mediaUrl);
    }
  }, [bannerImageData]);

  useEffect(() => {
    if (bannerTextData?.data?.text) {
      setBannerText(bannerTextData.data.text);
    }
  }, [bannerTextData]);

  useEffect(() => {
    if (bannerWordsData?.data?.words) {
      setBannerWords(bannerWordsData.data.words);
    }
  }, [bannerWordsData]);

  useEffect(() => {
    if (cellListData) {
      setMyGroupElements(cellListData.data);
    }
  }, [cellListData]);

  useEffect(() => {
    if (eventListData?.data?.memberEventList) {
      setEventElements(eventListData.data.memberEventList);
      setEventPageCount(Number(eventListData.data.memberEventList.length / 5));
    }
  }, [eventListData]);

  return (
    <Container>
      <AvoidingView contentContainerStyle={{ gap: 32 }}>
        <HomeTopContainer>
          <Header>
            <LeftHeader>
              <LogoSvg />
              <HeaderChurchText>{churchName}</HeaderChurchText>
              <HeaderChurchGroupText>{bodyName}</HeaderChurchGroupText>
            </LeftHeader>

            <RightHeader>
              <MyPageSvg />
            </RightHeader>
          </Header>

          <Banner source={{ uri: bannerImageUrl }}>
            <BannerTextContainer>
              <BannerText>{bannerText}</BannerText>
              <BannerVerse>{bannerWords}</BannerVerse>
            </BannerTextContainer>
          </Banner>
        </HomeTopContainer>

        <HomeBottomContainer>
          <MyGroupContainer>
            <MyGroupHeader>내 소그룹</MyGroupHeader>
            <MyGroupList
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {myGroupElements.map((x) => {
                return (
                  <MyGroupElement
                    imageUrl={
                      x.cellLogoUrl ?? "../../assets/home/sample-group.png"
                    }
                    peopleCount={x.cellMemberCount}
                    place={x.cellPlace}
                    title={x.cellName}
                  />
                );
              })}
            </MyGroupList>
          </MyGroupContainer>

          <EventContainer>
            <EventHeader>
              <EventLeftHeader>
                <EventDate>
                  {calendarYear}년 {calendarMonth}월
                </EventDate>
                <ArrowDownSvg />
              </EventLeftHeader>
              <EventRightHeader></EventRightHeader>
            </EventHeader>

            <EventListContainer>
              <EventList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, width: "100%" }}
              >
                <EventVerticalView>
                  {eventElements.map((x) => {
                    return (
                      <EventElement
                        userImageUrl={
                          x.profileImageUrl ??
                          "../../assets/home/sample-user.png"
                        }
                        userName={x.userName}
                      ></EventElement>
                    );
                  })}
                </EventVerticalView>
              </EventList>
              <EventPaging>
                {Array(eventPageCount).map((x, i) => {
                  if (i === currentEventPage) {
                    return <EllipseSvg />;
                  } else {
                    return <WhiteEllipseSvg />;
                  }
                })}
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
  color: #20342f;
  font-size: 16px;
  font-weight: 700;
`;

const HeaderChurchGroupText = styled.Text`
  font-family: Pretendard-Medium;
  color: #20342f;
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
  color: #20342f;
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

const EventRightHeader = styled.View``;

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
