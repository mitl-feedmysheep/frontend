import Header from '@components/common/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { styled } from 'styled-components/native';
import { RootStackParamList } from 'types/common';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingHome'>;

const MeetingHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  return (
    <Container>
      <Header title="민영목장" />
      <InnerContainer>

      </InnerContainer>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const InnerContainer = styled.