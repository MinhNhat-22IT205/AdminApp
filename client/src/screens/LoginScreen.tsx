import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {colors, styles} from './LoginScreen.styles';

import { showAlert, showConfirm } from '../utils/alert';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;


export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Thiếu thông tin', 'Vui lòng điền cả email và mật khẩu.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Email không hợp lệ', 'Vui lòng nhập một địa chỉ email hợp lệ.');
      return false;
    }
    if (password.length < 3) {
      showAlert('Mật khẩu yếu', 'Mật khẩu phải có ít nhất 3 ký tự.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { email, password });
      if (resp.data?.token) {
        setAuth(resp.data.token, resp.data.user);
        navigation.replace('Users');
      } else {
        showAlert('Đăng nhập thất bại', 'Không nhận được token từ máy chủ.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        'Đã có lỗi xảy ra. Vui lòng thử lại.';
      showAlert('Lỗi đăng nhập', message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng Admin</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
              </TouchableOpacity>
              
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
