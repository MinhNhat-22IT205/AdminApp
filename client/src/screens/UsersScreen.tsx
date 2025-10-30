import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
  Platform, // Import Platform
} from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {styles, colors} from './UsersScreen.styles';
import { showAlert, showConfirm } from '../utils/alert';

type UserItem = {
  id: string;
  username: string;
  email: string;
  image?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Users'>;



export default function UsersScreen({ navigation }: Props) {
  const { user, clearAuth } = useAuthStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<{
    id?: string;
    username: string;
    email: string;
    password: string;
    imageUri?: string;
  }>({
    username: '',
    email: '',
    password: '',
  });

  const [search, setSearch] = useState('');

  // --- Các hàm xử lý dữ liệu ---

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchUsers(); // reset nếu để trống
      return;
    }
    setLoading(true);
    try {
      const resp = await api.get(`/users/search?q=${encodeURIComponent(search)}`);
      setUsers(resp.data.users || []);
    } catch (err: any) {
      console.error('Search failed:', err);
      showAlert(
        'Lỗi tìm kiếm',
        err?.response?.data?.error || err.message || 'Không thể tìm kiếm người dùng.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/users');
      setUsers(resp.data.users || []);
    } catch (err: any) {
      console.error(err);
      showAlert(
        'Lỗi',
        err?.response?.data?.error || err.message || 'Không thể tải danh sách người dùng.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    if (!form.username.trim() || !form.email.trim()) {
      showAlert('Lỗi', 'Tên người dùng và email là bắt buộc.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showAlert('Lỗi', `Email không hợp lệ: ${form.email}`);
      return false;
    }

    if (!form.id && form.password.trim().length < 3) {
      showAlert('Mật khẩu yếu', 'Mật khẩu phải có ít nhất 3 ký tự cho người dùng mới.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Từ chối quyền', 'Cần cấp quyền truy cập thư viện ảnh');
      return null;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (r.canceled) return null;
    // @ts-ignore
    const uri = r.assets ? r.assets[0].uri : r.uri;
    return uri;
  };

  const openForm = (item?: UserItem) => {
    if (item) {
      setForm({
        id: item.id,
        username: item.username,
        email: item.email,
        password: '',
        imageUri: item.image ? `${api.defaults.baseURL}/${item.image}` : undefined,
      });
    } else {
      setForm({ username: '', email: '', password: '', imageUri: undefined });
    }
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) setForm({ ...form, imageUri: uri });
  };

  const handleSave = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
    const fd = new FormData();
    fd.append('username', form.username);
    fd.append('email', form.email);
    if (form.password) fd.append('password', form.password);
  
    // --- Handle image differently for Web vs Native ---
    if (form.imageUri && !form.imageUri.startsWith('http')) {
      const filename = form.imageUri.split('/').pop() || `photo-${Date.now()}.jpg`;
  
      if (Platform.OS === 'web') {
        // On web, fetch the file blob and append directly
        const response = await fetch(form.imageUri);
        const blob = await response.blob();
        fd.append('image', blob, filename);
      } else {
        // On mobile, send as file object
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        // @ts-ignore
        fd.append('image', { uri: form.imageUri, name: filename, type: mime });
      }
    }
  
    try {
      if (form.id) {
        await api.put(`/users/${form.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('Thành công', 'Cập nhật người dùng thành công.');
      } else {
        await api.post('/users', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('Thành công', 'Tạo người dùng thành công.');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Save failed:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        'Không thể lưu người dùng.';
      showAlert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };
  

  const deleteUser = (id: string) => {
    showConfirm(
      'Xác nhận',
      'Bạn có chắc muốn xóa người dùng này?',
      async () => {
        try {
          await api.delete(`/users/${id}`);
          showAlert('Đã xóa', 'Người dùng đã được xóa.');
          fetchUsers();
        } catch (err: any) {
          console.error(err);
          showAlert(
            'Xóa thất bại',
            err?.response?.data?.error || err?.response?.data?.message || err.message
          );
        }
      },
      () => {
        // optional cancel callback
        console.log('Delete canceled');
      }
    );
  };
  

  // --- Hàm Render ---

  const renderContent = () => {
    // Trạng thái loading (khi không mở modal)
    if (loading && !modalVisible) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // Trạng thái rỗng
    if (users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy người dùng nào.</Text>
          <Text style={styles.emptySubText}>
            Nhấn nút '+' ở góc dưới để thêm mới.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={users}
        keyExtractor={(i) => i.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              {item.image ? (
                <Image
                  source={{ uri: `${api.defaults.baseURL}/${item.image}` }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.placeholderText}>
                    {item.username[0] ? item.username[0].toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            </View>

            <View style={styles.cardButtonRow}>
              <TouchableOpacity
                onPress={() => openForm(item)}
                style={styles.cardButton}
              >
                <Text style={styles.cardButtonText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteUser(item.id)}
                style={[styles.cardButton, styles.deleteButton]}
              >
                <Text style={[styles.cardButtonText, styles.deleteButtonText]}>
                  Xóa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              clearAuth();
              navigation.replace('Login');
            }}
          >
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* --- Search Bar --- */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Tìm theo tên, email..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* --- Content (List/Loading/Empty) --- */}
        {renderContent()}

        {/* --- Add/Edit Modal --- */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {form.id ? 'Sửa người dùng' : 'Thêm người dùng'}
                </Text>

                {/* Image Picker */}
                {form.imageUri ? (
                  <Image source={{ uri: form.imageUri }} style={styles.imagePreview} />
                ) : (
                  <View style={[styles.imagePreview, styles.placeholderAvatar, { alignSelf: 'center' }]}>
                    <Text style={styles.placeholderText}>?</Text>
                  </View>
                )}
                <TouchableOpacity onPress={handlePickImage} style={styles.pickImageButton}>
                  <Text style={styles.pickImageButtonText}>Chọn ảnh</Text>
                </TouchableOpacity>

                {/* Form Inputs */}
                <TextInput
                  placeholder="Tên người dùng"
                  value={form.username}
                  onChangeText={(v) => setForm({ ...form, username: v })}
                  style={styles.input}
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  placeholder="Email"
                  value={form.email}
                  onChangeText={(v) => setForm({ ...form, email: v })}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  placeholder={form.id ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu'}
                  value={form.password}
                  onChangeText={(v) => setForm({ ...form, password: v })}
                  style={styles.input}
                  secureTextEntry
                  placeholderTextColor={colors.textSecondary}
                />

                {/* Modal Buttons */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                    disabled={loading}
                  >
                    <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.modalButtonText}>
                        {form.id ? 'Lưu' : 'Tạo'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- Floating Action Button --- */}
        <TouchableOpacity style={styles.fab} onPress={() => openForm()}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
