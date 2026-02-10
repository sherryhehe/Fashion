'use client';

import { useState, useCallback } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  onConfirm: (() => void) | null;
}

export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: null,
  });

  const showConfirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialog({
          isOpen: true,
          ...options,
          onConfirm: () => {
            setDialog((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
            resolve(true);
          },
        });
      });
    },
    []
  );

  const handleCancel = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
  }, [dialog.onConfirm]);

  return {
    dialog,
    showConfirm,
    handleCancel,
    handleConfirm,
  };
};

