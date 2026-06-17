// React Native StyleSheet - Replaces Tailwind CSS
import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../Data/colorsTheme';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.bgMain,
  },
  horizontalPadding: {
    paddingHorizontal: 16,
  },
  verticalPadding: {
    paddingVertical: 12,
  },
});

export const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textDark,
    marginLeft: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF4E6',
    borderWidth: 2,
    borderColor: '#FFD699',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: Colors.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.textDark,
    fontWeight: '700',
    fontSize: 13,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardContent: {
    justifyContent: 'space-between',
    minHeight: 140,
  },
});

export const textStyles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  h4: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  body: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 20,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
});

export const inputStyles = StyleSheet.create({
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    backgroundColor: Colors.bgCard,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF9F7',
  },
});

export const layoutStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  flexGrid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export const shadowStyles = StyleSheet.create({
  shadowSmall: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shadowMedium: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  shadowLarge: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default {
  globalStyles,
  headerStyles,
  buttonStyles,
  cardStyles,
  textStyles,
  inputStyles,
  layoutStyles,
  shadowStyles,
  Colors,
  dimensions: { width, height, isSmallDevice },
};
