import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { CustomDialog } from '../Components/UI';

// ──────────────────────────────────────────────────────────────
// DialogContext — one app-wide attractive modal that replaces the
// native Alert.alert popups. Any screen can call:
//   const { showAlert, showConfirm } = useDialog();
//   showAlert({ title, message, emoji, variant });
//   showConfirm({ title, message, confirmLabel, onConfirm, variant });
// ──────────────────────────────────────────────────────────────
const DialogContext = createContext(null);

const EMPTY = {
  visible: false,
  title: '',
  description: '',
  emoji: undefined,
  variant: 'info',
  primaryButtonLabel: 'Awesome!',
  secondaryButtonLabel: null,
  onPrimaryPress: () => {},
  onSecondaryPress: () => {},
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(EMPTY);

  const hide = useCallback(() => {
    setDialog((d) => ({ ...d, visible: false }));
  }, []);

  const showAlert = useCallback(
    ({ title, message = '', emoji, variant = 'info', buttonLabel = 'Got it!', onClose }) => {
      setDialog({
        ...EMPTY,
        visible: true,
        title,
        description: message,
        emoji,
        variant,
        primaryButtonLabel: buttonLabel,
        onPrimaryPress: onClose || (() => {}),
      });
    },
    []
  );

  const showConfirm = useCallback(
    ({
      title,
      message = '',
      emoji,
      variant = 'confirm',
      confirmLabel = 'Yes',
      cancelLabel = 'Cancel',
      onConfirm = () => {},
      onCancel = () => {},
    }) => {
      setDialog({
        ...EMPTY,
        visible: true,
        title,
        description: message,
        emoji,
        variant,
        primaryButtonLabel: confirmLabel,
        secondaryButtonLabel: cancelLabel,
        onPrimaryPress: onConfirm,
        onSecondaryPress: onCancel,
      });
    },
    []
  );

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <CustomDialog
        visible={dialog.visible}
        title={dialog.title}
        description={dialog.description}
        emoji={dialog.emoji}
        variant={dialog.variant}
        primaryButtonLabel={dialog.primaryButtonLabel}
        secondaryButtonLabel={dialog.secondaryButtonLabel}
        onPrimaryPress={dialog.onPrimaryPress}
        onSecondaryPress={dialog.onSecondaryPress}
        onDismiss={hide}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
};

export default DialogContext;
