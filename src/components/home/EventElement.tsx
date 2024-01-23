import styled from "styled-components/native";
import CakeSvg from "../../assets/home/cake.svg";

type Props = { userImageUrl: string; userName: string };

const EventElement: React.FC<Props> = (props) => {
  const { userImageUrl, userName } = props;

  return (
    <EventElementContainer>
      <EventUserContainer>
        <EventUserImage source={require("../../assets/home/sample-user.png")}></EventUserImage>
        <EventUserName>{userName}</EventUserName>
        <EventTypeContainer>
          <CakeSvg/>
          <EventName>생일</EventName>
        </EventTypeContainer>
      </EventUserContainer>
      <EventDateContainer>
        <EventDate>10.05 (목)</EventDate>
      </EventDateContainer>
    </EventElementContainer>
  )
}

const EventElementContainer = styled.View`
  display: flex;
  flex: 1;
  border-radius: 15px;
  justify-content: space-between;
  padding: 12px;
  background-color: #F5F7F5;
  flex-direction: row;
`;

const EventUserContainer = styled.View`
  display: flex;
  flex: 5;
  gap: 8px;
  flex-direction: row;
  align-items: center;
`;

const EventUserImage = styled.Image`
  border-radius: 8px;
`;

const EventUserName = styled.Text`
  font-family: Pretendard-Medium;
  font-size: 20px;
  font-weight: 500;
  text-align: left;
  color: #232323;
`;

const EventTypeContainer = styled.View`
  display: flex;
  border-radius: 4px;
  padding: 4px 4px 4px 4px;
  background-color: #EBEFD4;
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;

const EventName = styled.Text`
  font-family: Pretendard-Medium;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  padding: 0 2px 0 2px;
  color: #599962;
`;

const EventDateContainer = styled.View`
  display: flex;
  flex: 1;
  flex-direction: row-reverse;
  align-items: center;
`;

const EventDate = styled.Text`
  display: flex;
  font-family: Pretendard-Medium;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
`;

export default EventElement;