import React from 'react';
import DropShadow from 'react-native-drop-shadow';

type Props = {
  children: any;
  type: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'two_xl';
};

const shadowSet = {
  xs: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  two_xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
};

const Shadow: React.FC<Props> = ({ children, type = 'xs' }) => {
  return <DropShadow style={shadowSet[type]}>{children}</DropShadow>;
};

export default Shadow;
