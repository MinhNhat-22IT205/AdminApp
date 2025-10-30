import { Platform, StyleSheet } from 'react-native';

// Định nghĩa bảng màu
const colors = {
    primary: '#007AFF',
    white: '#FFFFFF',
    background: '#F4F7FA', // Nền màn hình
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    placeholder: '#EEEEEE',
    danger: '#E53935',
    lightGray: '#DDDDDD',
    darkGray: '#999999',
    border: '#E0E0E0',
  };

const styles = StyleSheet.create({
    // --- Layout ---
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    // --- Header ---
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    logoutButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.placeholder,
    },
    logoutButtonText: {
      color: colors.textSecondary,
      fontWeight: '500',
    },
    // --- Search ---
    searchContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.white,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
    },
    searchButton: {
      marginLeft: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    searchButtonText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 16,
    },
    // --- List States ---
    list: {
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: 50,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    emptySubText: {
      fontSize: 14,
      color: colors.darkGray,
      marginTop: 8,
      textAlign: 'center',
    },
    // --- Card ---
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28, // Tròn
      backgroundColor: colors.placeholder,
    },
    placeholderAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28, // Tròn
      backgroundColor: colors.placeholder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    userInfo: {
      marginLeft: 12,
      flex: 1,
    },
    username: {
      fontWeight: '700',
      fontSize: 16,
      color: colors.text,
    },
    email: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    cardButtonRow: {
      flexDirection: 'row',
      marginTop: 4,
      borderTopWidth: 1,
      borderColor: colors.placeholder,
    },
    cardButton: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
    },
    cardButtonText: {
      color: colors.primary,
      fontWeight: '600',
    },
    deleteButton: {
      borderLeftWidth: 1,
      borderColor: colors.placeholder,
    },
    deleteButtonText: {
      color: colors.danger,
    },
    // --- Modal ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 16,
    },
    modalBox: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      maxHeight: '90%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center',
      color: colors.text,
    },
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: 50, // Tròn
      alignSelf: 'center',
      marginBottom: 12,
      backgroundColor: colors.placeholder,
    },
    pickImageButton: {
      padding: 10,
      borderRadius: 8,
      backgroundColor: colors.placeholder,
      alignItems: 'center',
      marginBottom: 16,
    },
    pickImageButtonText: {
      color: colors.textSecondary,
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 10,
      marginBottom: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.white,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      marginTop: 16,
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      minHeight: 50, // Đảm bảo chiều cao
      justifyContent: 'center',
    },
    modalButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    cancelButton: {
      backgroundColor: colors.placeholder,
      marginRight: 10,
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    // --- FAB ---
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    fabText: {
      fontSize: 30,
      color: 'white',
      lineHeight: 30,
    },
  });
export { styles, colors };