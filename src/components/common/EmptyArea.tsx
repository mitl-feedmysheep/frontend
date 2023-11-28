import React from "react";
import { styled } from "styled-components/native";

type Props = {};

const EmptyArea: React.FC<Props> = ({ height, width }) => {
  return <Container height={height} width={width} />;
};

const Container = styled.View`
  height: ${({ height }) => height || 0};
  width: ${({ width }) => width || 0};
`;

export default EmptyArea;
