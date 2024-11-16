import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMonth: (date: string) => void;
  initialDate?: Date;
}

type Styles = {
  overlay: ViewStyle;
  overlayBackground: ViewStyle;
  modalContainer: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  listContainer: ViewStyle;
  dateItem: ViewStyle;
  selectedItem: ViewStyle;
  dateText: TextStyle;
  selectedText: TextStyle;
  inactiveText: TextStyle;
  confirmButton: ViewStyle;
  confirmText: TextStyle;
};

const SCREEN_HEIGHT = Dimensions.get('window').height - 200;

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  onClose,
  onSelectMonth,
  initialDate,
}) => {
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [selectedYear, setSelectedYear] = useState(
    initialDate?.getFullYear() || new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    initialDate?.getMonth() + 1 || new Date().getMonth() + 1,
  );

  const years = [selectedYear - 2, selectedYear - 1, selectedYear];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSelect = (year: number, month: number): void => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleConfirm = (): void => {
    onSelectMonth(`${selectedYear}년 ${selectedMonth}월`);
    onClose();
  };

  const renderMonths = (year: number) => {
    return months.map(month => {
      const isSelected = year === selectedYear && month === selectedMonth;
      return (
        <TouchableOpacity
          key={`${year}-${month}`}
          style={[styles.dateItem, isSelected && styles.selectedItem]}
          onPress={() => handleSelect(year, month)}>
          <Text
            style={[
              styles.dateText,
              isSelected && styles.selectedText,
              year !== selectedYear && styles.inactiveText,
            ]}>
            {year}년 {month}월
          </Text>
        </TouchableOpacity>
      );
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={styles.title}>월 선택하기</Text>
          <View style={styles.content}>
            {years.map(year => (
              <View key={year}>{renderMonths(year)}</View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create<Styles>({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  dateItem: {
    paddingVertical: 15,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedItem: {
    backgroundColor: '#e9ecef',
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  selectedText: {
    color: '#000',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#adb5bd',
  },
  confirmButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#4a635c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
