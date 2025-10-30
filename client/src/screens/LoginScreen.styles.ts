import { StyleSheet } from 'react-native';

// Định nghĩa bảng màu
const colors = {
    primary: '#007AFF',
    background: '#F4F7FA',
    white: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    danger: '#E53935',
  };

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    formContainer: {
      width: '100%',
    },
    input: {
      backgroundColor: colors.white,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonSecondary: {
      padding: 16,
      alignItems: 'center',
    },
    buttonSecondaryText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    loadingIndicator: {
      marginTop: 20,
    },
  });

  export { styles, colors };