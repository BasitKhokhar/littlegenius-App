import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../Data/colorsTheme';

const CustomDialog = ({
  visible = false,
  title = '',
  description = '',
  emoji = '🎓',
  primaryButtonLabel = 'Awesome!',
  secondaryButtonLabel = null,
  onPrimaryPress = () => {},
  onSecondaryPress = () => {},
  onDismiss = () => {},
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  onPrimaryPress();
                  onDismiss();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {primaryButtonLabel}
                </Text>
              </TouchableOpacity>

              {secondaryButtonLabel && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    onSecondaryPress();
                    onDismiss();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButtonLabel}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalView: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#F0E6D8',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.textDark,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});

export default CustomDialog;
