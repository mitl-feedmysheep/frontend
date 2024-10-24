import React, { useMemo } from 'react';
import { View } from 'react-native';
import { styled } from 'styled-components/native';

type Props = {
  children: any;
  type:
    | 'H1'
    | 'H2'
    | 'H3'
    | 'B1'
    | 'B2'
    | 'B3'
    | 'B4'
    | 'caption'
    | 'actionBar';
  color: string;
  textAlign?: 'center' | 'start';
};

const H1 = styled.Text`
  font-family: Pretendard-Medium;
  color: ${({ color }) => color};
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: 44px; /* 137.5% */
  letter-spacing: 0.8px;
  text-align: ${({ textAlign }) => textAlign};
`;

const H2 = styled.Text`
  font-family: Pretendard-Medium;
  color: ${({ color }) => color};
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 34px; /* 141.667% */
  letter-spacing: 0.6px;
  text-align: ${({ textAlign }) => textAlign};
`;

const H3 = styled.Text`
  font-family: Pretendard-Regular;
  color: ${({ color }) => color};
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 34px; /* 141.667% */
  letter-spacing: 0.6px;
  text-align: ${({ textAlign }) => textAlign};
`;

const B1 = styled.Text`
  font-family: Pretendard-Regular;
  color: ${({ color }) => color};
  font-size: 17px;
  font-style: normal;
  font-weight: 400;
  line-height: 23px; /* 135.294% */
  letter-spacing: 0.425px;
  text-align: ${({ textAlign }) => textAlign};
`;

const B2 = styled.Text`
  font-family: Pretendard-Regular;
  color: ${({ color }) => color};
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 21px; /* 150% */
  letter-spacing: 0.35px;
  text-align: ${({ textAlign }) => textAlign};
`;

const B3 = styled.Text`
  font-family: Pretendard-Regular;
  color: ${({ color }) => color};
  font-size: 17px;
  font-style: normal;
  font-weight: 500;
  line-height: 23px; /* 135.294% */
  letter-spacing: 0.425px;
  text-align: ${({ textAlign }) => textAlign};
`;

const B4 = styled.Text`
  font-family: Pretendard-Medium;
  color: ${({ color }) => color};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 21px; /* 150% */
  letter-spacing: 0.35px;
  text-align: ${({ textAlign }) => textAlign};
`;

const Caption = styled.Text`
  font-family: Pretendard-Medium;
  color: ${({ color }) => color};
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px; /* 158.333% */
  letter-spacing: 0.3px;
  text-align: ${({ textAlign }) => textAlign};
`;

const ActionBar = styled.Text`
  font-family: Pretendard-Medium;
  color: ${({ color }) => color};
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px; /* 180% */
  letter-spacing: 0.25px;
  text-align: ${({ textAlign }) => textAlign};
`;

const textSet = {
  H1: H1,
  H2: H2,
  H3: H3,
  B1: B1,
  B2: B2,
  B3: B3,
  B4: B4,
  caption: Caption,
  actionBar: ActionBar,
};

const Typo: React.FC<Props> = ({
  children,
  color = '#000000',
  type = 'H1',
  textAlign = 'start',
}) => {
  const TextWrapper = useMemo(() => {
    return textSet[type];
  }, [type]);
  return (
    <TextWrapper color={color} textAlign={textAlign}>
      {children}
    </TextWrapper>
  );
};

export default Typo;
