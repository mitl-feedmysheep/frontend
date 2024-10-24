import React from 'react';
import { styled } from 'styled-components/native';
interface Props {
  height?: number;
  width?: number;
}

const EmptyArea: React.FC<Props> = ({ height, width }) => {
  return <Container height={height} width={width} />;
};

const Container = styled.View<Props>`
  height: ${({ height }) => height || 0};
  width: ${({ width }) => width || 0};
`;

export default EmptyArea;
