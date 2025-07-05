import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RetroButton } from './RetroButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log error to analytics service in production
    if (__DEV__) {
      console.group('🚨 Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleRestart = () => {
    Alert.alert(
      'Restart App',
      'This will restart the app. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: () => {
            // In a real app, you might want to reload the entire app
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null,
            });
          },
        },
      ]
    );
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = `
Error Report:
${error?.toString()}

Stack Trace:
${errorInfo?.componentStack}

Time: ${new Date().toISOString()}
    `;

    Alert.alert(
      'Error Report',
      'Copy this error report and send it to support:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy',
          onPress: () => {
            // In a real app, you'd copy to clipboard
            console.log('Error Report:', errorReport);
            Alert.alert('Copied!', 'Error report copied to console.');
          },
        },
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
            style={styles.background}
          >
            <ScrollView contentContainerStyle={styles.content}>
              {/* Error Icon */}
              <View style={styles.errorIcon}>
                <Text style={styles.errorEmoji}>💥</Text>
              </View>

              {/* Error Title */}
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.subtitle}>
                The app encountered an unexpected error
              </Text>

              {/* Error Details */}
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error?.message || 'Unknown error occurred'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <RetroButton
                  title="Try Again"
                  onPress={() => {
                    this.setState({
                      hasError: false,
                      error: null,
                      errorInfo: null,
                    });
                  }}
                  variant="primary"
                  size="large"
                  style={styles.button}
                />

                <RetroButton
                  title="Report Error"
                  onPress={this.handleReportError}
                  variant="warning"
                  size="large"
                  style={styles.button}
                />

                <RetroButton
                  title="Restart App"
                  onPress={this.handleRestart}
                  variant="danger"
                  size="large"
                  style={styles.button}
                />
              </View>

              {/* Debug Info (only in development) */}
              {__DEV__ && this.state.errorInfo && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Debug Information:</Text>
                  <ScrollView style={styles.debugScroll}>
                    <Text style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </ScrollView>
                </View>
              )}

              {/* Help Text */}
              <Text style={styles.helpText}>
                If this problem persists, please contact support with the error details.
              </Text>
            </ScrollView>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 3,
    borderColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  errorEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    marginBottom: 15,
  },
  debugContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  debugScroll: {
    maxHeight: 150,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 