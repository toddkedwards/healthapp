import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { soundService } from '../services/soundService';
import PixelText from '../components/PixelText';
import { RetroButton } from '../components/RetroButton';
import PixelBackground from '../components/PixelBackground';

export default function AuthScreen() {
  const { theme } = useTheme();
  const { signIn, signUp, loading, getAuthStatus } = useAuth();
  const { showNotification } = useNotification();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [debugMode, setDebugMode] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (isSignUp) {
      if (!username) {
        showNotification('Please enter a username', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }
      if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
      }
      if (username.length < 3) {
        showNotification('Username must be at least 3 characters', 'error');
        return;
      }
    }

    try {
      soundService.playButtonClick();
      
      if (isSignUp) {
        console.log('📝 AuthScreen: Starting sign up...');
        await signUp(email, password, username);
        showNotification('Account created successfully! Welcome to GeekFit!', 'success');
      } else {
        console.log('🔑 AuthScreen: Starting sign in...');
        await signIn(email, password);
        showNotification('Welcome back, Hero!', 'success');
      }
    } catch (error: any) {
      console.error('❌ AuthScreen: Authentication error:', error);
      
      // Show detailed error message
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      showNotification(errorMessage, 'error');
      
      // Log debug information
      const authStatus = getAuthStatus();
      console.log('🔍 AuthScreen: Debug info:', {
        error: error.message,
        authStatus,
        email,
        isSignUp,
        hasUsername: !!username
      });
    }
  };

  const toggleMode = () => {
    soundService.playButtonClick();
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  const handleShowDebugInfo = () => {
    const authStatus = getAuthStatus();
    Alert.alert(
      'Debug Information',
      `Auth Service Status:
• Initialized: ${authStatus.isInitialized}
• Current User: ${authStatus.currentUser ? authStatus.currentUser.username : 'None'}
• Firebase Auth: ${authStatus.authInstance ? 'Available' : 'Not Available'}

Current Form State:
• Mode: ${isSignUp ? 'Sign Up' : 'Sign In'}
• Email: ${email || 'Empty'}
• Username: ${username || 'Empty'}
• Password Length: ${password.length}`,
      [{ text: 'OK' }]
    );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getEmailError = () => {
    if (email && !validateEmail(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const getPasswordError = () => {
    if (password && password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const getConfirmPasswordError = () => {
    if (isSignUp && confirmPassword && password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const emailError = getEmailError();
  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();

  return (
    <PixelBackground>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <PixelText style={[styles.title, { color: theme.colors.text }]}>
              🎮 GeekFit
            </PixelText>
            <PixelText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isSignUp ? 'Create Your Account' : 'Welcome Back, Hero!'}
            </PixelText>
          </View>

          <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
            {isSignUp && (
              <View style={styles.inputGroup}>
                <PixelText style={[styles.label, { color: theme.colors.text }]}>
                  Username
                </PixelText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.accent 
                  }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <PixelText style={[styles.label, { color: theme.colors.text }]}>
                Email
              </PixelText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: emailError ? '#ff6b6b' : theme.colors.accent 
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <PixelText style={[styles.label, { color: theme.colors.text }]}>
                Password
              </PixelText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: passwordError ? '#ff6b6b' : theme.colors.accent 
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <PixelText style={[styles.label, { color: theme.colors.text }]}>
                  Confirm Password
                </PixelText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: confirmPasswordError ? '#ff6b6b' : theme.colors.accent 
                  }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {confirmPasswordError && (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                )}
              </View>
            )}

            <RetroButton
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleAuth}
              disabled={loading}
              style={styles.authButton}
            />

            <View style={styles.toggleContainer}>
              <PixelText style={[styles.toggleText, { color: theme.colors.textSecondary }]}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </PixelText>
              <RetroButton
                title={isSignUp ? 'Sign In' : 'Sign Up'}
                onPress={toggleMode}
                variant="secondary"
                size="small"
                style={styles.toggleButton}
              />
            </View>

            {/* Debug button (only in development) */}
            {__DEV__ && (
              <RetroButton
                title="Debug Info"
                onPress={handleShowDebugInfo}
                variant="warning"
                size="small"
                style={styles.debugButton}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  authButton: {
    marginTop: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  toggleText: {
    fontSize: 14,
    marginRight: 8,
  },
  toggleButton: {
    marginLeft: 8,
  },
  debugButton: {
    marginTop: 10,
  },
}); 