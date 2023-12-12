import styled from "styled-components/native";
import PeopleSvg from "../../assets/home/people.svg";
import PlaceSvg from "../../assets/home/place.svg";

type Props = { imageUrl: string; peopleCount: number; place: string; title: string; };

const MyGroupElement: React.FC<Props> = (props) => {
  const { imageUrl, peopleCount, place, title } = props;

  return (
    <MyGroupElementContainer>
      <MyGroupElementImage source={require("../../assets/home/sample-group.png")}></MyGroupElementImage>
      <MyGroupElementTextContainer>
        <MyGroupElementMetaContainer>
            <MyGroupElementPeopleContainer>
              <PeopleSvg/>
              <MyGroupElementPeopleText>{peopleCount}명</MyGroupElementPeopleText>
            </MyGroupElementPeopleContainer>
            <MyGroupElementPlaceContainer>
              <PlaceSvg/>
              <MyGroupElementPlaceText>{place}</MyGroupElementPlaceText>
            </MyGroupElementPlaceContainer>
        </MyGroupElementMetaContainer> 
        <MyGroupElementTitleText>{title}</MyGroupElementTitleText>
      </MyGroupElementTextContainer>
    </MyGroupElementContainer>
  )
}

const MyGroupElementContainer = styled.View`
  display: flex;
  background-color: #F5F7F5;
  border-radius: 20px;
  padding: 8px 12px 16px 12px;
  gap: 12px;
`;

const MyGroupElementImage = styled.Image`
  display: flex;
  border-radius: 15px;
`;

const MyGroupElementTextContainer = styled.View`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const MyGroupElementMetaContainer = styled.View`
  display: flex;
  gap: 8px;
  flex-direction: row;
`

const MyGroupElementPeopleContainer = styled.View`
  display: flex;
  gap: 2px;
  flex-direction: row;
  align-items: center;
`;

const MyGroupElementPeopleText = styled.Text`
  display: flex;
  font-family: Pretendard-Medium;
  font-size: 12px;
  font-weight: 400;
  color: #4B6050;
`;

const MyGroupElementPlaceContainer = styled.View`
  display: flex;
  gap: 2px;
  flex-direction: row;
  align-items: center;
`;

const MyGroupElementPlaceText = styled.Text`
  display: flex;
  font-family: Pretendard-Medium;
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  color: #4B6050;
`;

const MyGroupElementTitleText = styled.Text`
  display: flex;
  font-family: Pretendard-Medium;
  color: #070908;
  font-size: 20px;
  line-height: 20px;
  font-weight: 600;  
`;

export default MyGroupElement;