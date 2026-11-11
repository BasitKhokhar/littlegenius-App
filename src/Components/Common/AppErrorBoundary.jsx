import React from 'react';
import {
  DevSettings,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { reportBoundaryError } from '../../Services/crashReporting';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false, retryKey: 0, eventId: null, restarting: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const eventId = reportBoundaryError(error, info?.componentStack);
    if (eventId) this.setState({ eventId });
  }

  tryAgain = () => {
    this.setState((state) => ({
      hasError: false,
      retryKey: state.retryKey + 1,
      eventId: null,
      restarting: false,
    }));
  };

  restart = async () => {
    if (this.state.restarting) return;
    this.setState({ restarting: true });

    try {
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
        return;
      }
      DevSettings.reload();
    } catch (error) {
      reportBoundaryError(error, 'Failed to reload from the root error boundary');
      this.setState({ restarting: false });
    }
  };

  render() {
    if (!this.state.hasError) {
      return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
    }

    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.card} accessibilityRole="alert">
          <View style={styles.mascot}>
            <Text style={styles.mascotText} accessibilityLabel="Little Genius mascot">🧠</Text>
          </View>
          <Text style={styles.eyebrow}>LITTLE GENIUS</Text>
          <Text style={styles.title}>Oops! Let’s try that again</Text>
          <Text style={styles.message}>
            Your learning progress is safe. Try opening this screen again, or restart the app if the problem continues.
          </Text>

          {this.state.eventId ? (
            <Text selectable style={styles.incidentId}>Incident ID: {this.state.eventId}</Text>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.86}
            style={styles.primaryButton}
            onPress={this.tryAgain}
          >
            <Ionicons name="refresh" size={21} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            disabled={this.state.restarting}
            style={[styles.secondaryButton, this.state.restarting && styles.disabledButton]}
            onPress={this.restart}
          >
            <Text style={styles.secondaryButtonText}>
              {this.state.restarting ? 'Restarting…' : 'Restart app'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#1E1B4B',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  mascot: {
    width: 82,
    height: 82,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: '#EEF2FF',
  },
  mascotText: { fontSize: 42 },
  eyebrow: {
    marginBottom: 8,
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: '#1E1B4B',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    maxWidth: 430,
    marginTop: 12,
    marginBottom: 18,
    color: '#5B5874',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  incidentId: {
    maxWidth: '100%',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    color: '#68657E',
    backgroundColor: '#F5F3FF',
    fontSize: 11,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: {
    minHeight: 48,
    marginTop: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#5B5874', fontSize: 14, fontWeight: '800' },
  disabledButton: { opacity: 0.55 },
});
