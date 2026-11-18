import React, { useRef } from 'react';
import { Alert } from '@ios27_design_system/react';

export type ConfirmAlertProps = {
  open: boolean;
  /** Called when the alert is dismissed without confirming (cancel, backdrop, Escape). */
  onCancel: () => void;
  /** Called when the confirm button is pressed. */
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Renders the confirm button in red (default true: deletions, leaving…). */
  destructive?: boolean;
};

/**
 * iOS 27 confirmation alert, built on the `Alert` component of
 * @ios27_design_system/react (Liquid Glass material, focus trap, Escape to cancel).
 *
 * Buttons are stacked when the labels are long so they never get truncated.
 */
const ConfirmAlert: React.FC<ConfirmAlertProps> = ({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  destructive = true,
}) => {
  const stacked = confirmLabel.length + cancelLabel.length > 22;

  // The Alert reports every close through onChange(false), including after an
  // action. `confirmedRef` lets us tell a confirmation from a dismissal.
  const confirmedRef = useRef(false);

  return (
    <Alert
      open={open}
      onChange={(next) => {
        if (next) return;
        if (!confirmedRef.current) onCancel();
        confirmedRef.current = false;
      }}
      title={title}
      message={message}
      className={stacked ? 'kdo-alert--stacked' : undefined}
      actions={[
        {
          label: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onClick: () => {
            confirmedRef.current = true;
            onConfirm();
          },
        },
        { label: cancelLabel, style: 'cancel', onClick: () => undefined },
      ]}
    />
  );
};

export default ConfirmAlert;
