import React from 'react';
import { styled } from 'styled-components/native';
import FastImage from 'react-native-fast-image';
import DefaultProfile from '../../assets/images/default_profile.svg';
import BirthdayIcon from '../../assets/icon/ic_base_chip.svg';

interface Props {
  uri?: string;
  isBirthday?: boolean;
}

const Profile: React.FC<Props> = ({ uri, isBirthday = false }) => {
  return (
    <Container>
      {uri ? (
        <FastImage
          style={{ width: 44, height: 44, borderRadius: 8 }}
          source={{
            uri,
            headers: { Authorization: 'someAuthToken' },
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <DefaultProfile />
      )}
      {isBirthday && (
        <IconContainer>
          <BirthdayIcon />
        </IconContainer>
      )}
    </Container>
  );
};

const Container = styled.View`
  border-radius: 8px;
`;

const IconContainer = styled.View`
  position: absolute;
  right: -3px;
  bottom: -4px;
`;

export default Profile;
