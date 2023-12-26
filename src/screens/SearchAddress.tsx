import React from "react";
import { SafeAreaView } from "react-native";
import { styled } from "styled-components/native";
import Postcode from "@actbase/react-daum-postcode";

type Props = {};

const SearchAddress: React.FC<Props> = ({ navigation, route }) => {
  return (
    <SafeAreaView>
      <Container
        jsOptions={{ animation: true }}
        onSelected={(data) => {
          const { address, jibunAddress } = data;
          if (route.params?.onSendingAddress) {
            route.params.onSendingAddress({
              address,
              jibunAddress,
            });
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
};

const Container = styled(Postcode)`
  width: 100%;
  height: 100%;
`;

export default SearchAddress;
