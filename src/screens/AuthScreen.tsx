import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const { signIn, signUp, loading } = useAuth();
  const { showNotification } = useNotification();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    }

    try {
      soundService.playButtonClick();
      
      if (isSignUp) {
        await signUp(email, password, username);
        showNotification('Account created successfully!', 'success');
      } else {
        await signIn(email, password);
        showNotification('Welcome back!', 'success');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = 'Authentication failed';
      
      if (error.code === 'auth/user-not-found') {
        message = 'User not found. Please check your email or sign up.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address. Please check your email.';
      }
      
      showNotification(message, 'error');
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
                  borderColor: theme.colors.accent 
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <PixelText style={[styles.label, { color: theme.colors.text }]}>
                Password
              </PixelText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.accent 
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />
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
                    borderColor: theme.colors.accent 
                  }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
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
                style={styles.toggleButton}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <PixelText style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Level up your fitness game! 🎮💪
            </PixelText>
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
    borderRadius: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  authButton: {
    marginTop: 8,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 14,
    marginBottom: 8,
  },
  toggleButton: {
    minWidth: 100,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 