import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonProps,
} from '@mui/material';

interface DialogButton {
  text: string;
  action?: () => void;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
}

interface DialogData {
  title: React.ReactNode;
  message: React.ReactNode;
  buttons: DialogButton[];
}

export const defaultDialogData: DialogData = {
  title: '',
  message: '',
  buttons: [],
};

export type DialogContextType = {
  open: (data: DialogData) => void;
  close: () => void;
  openConfirmDialog: (
    title: React.ReactNode,
    message: React.ReactNode,
    onConfirm: () => void,
    confirmButtonText?: string,
    confirmButtonColor?: ButtonProps['color']
  ) => void;
};

const DialogContext = createContext<DialogContextType>(undefined!);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogData, setDialogData] = useState<DialogData>(defaultDialogData);
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
    setDialogData(defaultDialogData);
  };

  const open = (data: DialogData) => {
    setIsOpen(true);
    setDialogData(data);
  };

  const openConfirmDialog = (
    title: React.ReactNode,
    message: React.ReactNode,
    onConfirm: () => void,
    confirmButtonText = 'Confirm',
    confirmButtonColor: ButtonProps['color'] = 'primary'
  ) => {
    open({
      title,
      message,
      buttons: [
        {
          text: 'Cancel',
          color: 'inherit',
          action: close,
        },
        {
          text: confirmButtonText,
          color: confirmButtonColor,
          action: () => {
            onConfirm();
            close();
          },
        },
      ],
    });
  };

  const value = useMemo(() => ({ open, close, openConfirmDialog }), []);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>{dialogData.title}</DialogTitle>
        <DialogContent>{dialogData.message}</DialogContent>
        <DialogActions>
          {dialogData.buttons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant || 'text'}
              color={button.color || 'primary'}
              onClick={() => {
                button.action?.();
                close();
              }}
            >
              {button.text}
            </Button>
          ))}
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialogContext = () => {
  return useContext(DialogContext);
};
