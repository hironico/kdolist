import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import BottomDialog, { BottomDialogAction } from '@/components/BottomDialog/BottomDialog';
import { LoginContext } from '@/LoginContext';
import usePWAInstall from './usePWAInstall';

// Delay before the automatic prompt shows up once the user is logged in.
const AUTO_PROMPT_DELAY_MS = 4000;

export function PWAInstallPrompt() {
  const { loginInfo } = useContext(LoginContext);
  const isLoggedIn = Boolean(loginInfo?.jwt);

  const {
    platform,
    canInstall,
    dialogRequested,
    promptInstall,
    clearInstallDialogRequest,
    isSnoozed,
    snoozeInstallPrompt,
  } = usePWAInstall();

  const [autoOpen, setAutoOpen] = useState(false);
  const [showIosTutorial, setShowIosTutorial] = useState(false);

  // Automatic prompt: once logged in, only if installable and not snoozed.
  useEffect(() => {
    if (!isLoggedIn || !canInstall || isSnoozed()) {
      return;
    }
    const timer = setTimeout(() => setAutoOpen(true), AUTO_PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isLoggedIn, canInstall]);

  const open = canInstall && (autoOpen || dialogRequested);
  const isIOS = platform === 'ios-safari' || platform === 'ios-edge';

  const closeDialog = () => {
    setAutoOpen(false);
    setShowIosTutorial(false);
    clearInstallDialogRequest();
  };

  const handleLater = () => {
    snoozeInstallPrompt();
    closeDialog();
  };

  const handleInstall = async () => {
    await promptInstall();
    closeDialog();
  };

  const laterAction: BottomDialogAction = {
    icon: <CloseIcon />,
    label: 'Plus tard',
    onClick: handleLater,
  };

  let actions: BottomDialogAction[];
  if (isIOS) {
    actions = showIosTutorial
      ? [
          {
            icon: <CheckIcon />,
            label: 'Compris !',
            onClick: closeDialog,
            isPrimary: true,
          },
        ]
      : [
          {
            icon: <HelpOutlineIcon />,
            label: 'Comment faire ?',
            onClick: () => setShowIosTutorial(true),
            isPrimary: true,
          },
          laterAction,
        ];
  } else {
    actions = [
      {
        icon: <InstallMobileIcon />,
        label: 'Installer',
        onClick: handleInstall,
        isPrimary: true,
      },
      laterAction,
    ];
  }

  const introContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="body1" sx={{ pb: 1 }}>
        Installez <strong>Kdolist</strong> sur votre écran d'accueil ou votre bureau pour un
        accès rapide, une expérience en plein écran et un fonctionnement plus fluide, même hors
        connexion !
      </Typography>
    </Box>
  );

  const iosTutorialContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ pb: 1 }}>
        Comment installer sur iPhone / iPad :
      </Typography>
      {platform === 'ios-edge' ? (
        <>
          <Typography variant="body2" sx={{ pb: 0.5 }}>
            1. Appuyez sur le menu <strong>⋯</strong> en bas d'Edge.
          </Typography>
          <Typography variant="body2" sx={{ pb: 0.5 }}>
            2. Appuyez sur <strong>"Partager"</strong>, puis sur{' '}
            <strong>"Ajouter à l'écran d'accueil"</strong>.
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ pb: 0.5 }}>
            1. Appuyez sur l'icône <strong>Partage</strong> (⬆) de Safari.
          </Typography>
          <Typography variant="body2" sx={{ pb: 0.5 }}>
            2. Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong>.
          </Typography>
        </>
      )}
      <Typography variant="body2">
        3. Confirmez en appuyant sur <strong>"Ajouter"</strong>.
      </Typography>
    </Box>
  );

  const title = isIOS && showIosTutorial ? 'Comment installer sur iOS' : 'Installer Kdolist';

  return (
    <BottomDialog
      open={open}
      handleClose={handleLater}
      title={title}
      contents={isIOS && showIosTutorial ? iosTutorialContent : introContent}
      actions={actions}
    />
  );
}
