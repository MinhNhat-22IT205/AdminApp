// utils/alert.ts
import { Platform, Alert } from 'react-native';

export const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    // Use window.alert for web
    window.alert(`${title}\n\n${message || ''}`);
  } else {
    // Use native Alert for mobile
    Alert.alert(title, message);
  }
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
    else onCancel?.();
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm },
    ]);
  }
};
