import React, { useState, useEffect, ReactElement } from 'react';
import {
  IconButton,
  Box,
  styled,
  ListItemText,
  ListItemButton,
  ListItem,
  ListItemAvatar,
  Avatar,
  Theme,
  useTheme,
  keyframes,
} from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { useSwipeableList } from './SwipeableListContext';

// Bounce animation keyframes - starts completely invisible
const bounceIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Styled components
const SwipeableCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
}));

// `transform` is a style-only prop: don't forward it to the DOM. The theme is
// injected by `styled` itself and must not be passed as a prop (passing it
// makes MUI try to overwrite a read-only `theme` and crash in some setups).
const CardWrapper = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'transform',
})<{ transform: string }>(
  ({ transform, theme }) => ({
    display: 'flex',
    transform,
    transition: 'transform 0.3s ease-out',
    backgroundColor: theme.palette.background.paper,
    padding: '0px',
    margin: '0px',
    // Never wider than the list: long names must wrap, not push the row out.
    minWidth: 0,
    maxWidth: '100%',
  }),
);

const ActionsWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
}));

/**
 * iOS 27 swipe action: a filled circular button with a white glyph
 * (red for destructive, grey for neutral, accent colour otherwise).
 * Each action keeps the 50px slot used by the swipe distance computation.
 */
const swipeActionSx = (theme: Theme, color: SwipeableListItemAction['color']) => {
  const fill = color === 'default' ? theme.palette.secondary.main : theme.palette[color].main;
  return {
    width: 40,
    height: 40,
    mx: '5px',
    bgcolor: fill,
    color: '#ffffff',
    '&:hover': { bgcolor: fill },
  };
};

export interface SwipeableListItemAction {
  icon: ReactElement;
  /** Fill colour of the iOS circular action ('default' = neutral grey). */
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onAction: () => void;
  /** Accessible name of the action button (e.g. "Supprimer"). */
  ariaLabel?: string;
}

export interface SwipeableListItemProps {
  primaryText: ReactElement | string;
  secondaryText: ReactElement | string;
  action1?: SwipeableListItemAction;
  action2?: SwipeableListItemAction;
  action3?: SwipeableListItemAction;
  onClickMain?: () => void;
  icon?: ReactElement;
  /**
   * Background of the iOS icon tile. Any CSS colour or palette path
   * (e.g. 'success.main'); 'none' renders the icon as is (photos, avatars).
   * Defaults to the accent colour.
   */
  iconTint?: string;
  keyId: string;
  rightContent?: ReactElement;
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  primaryText,
  secondaryText,
  action1,
  action2,
  action3,
  onClickMain,
  icon,
  iconTint,
  keyId,
  rightContent,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [action1Bounced, setAction1Bounced] = useState(false);
  const [action2Bounced, setAction2Bounced] = useState(false);
  const [action3Bounced, setAction3Bounced] = useState(false);

  const theme = useTheme();
  const { openItemId, setOpenItemId } = useSwipeableList();

  // Close this item if another item is opened
  useEffect(() => {
    if (openItemId !== keyId && isOpen) {
      setIsOpen(false);
      setAction1Bounced(false);
      setAction2Bounced(false);
      setAction3Bounced(false);
    }
  }, [openItemId, keyId, isOpen]);

  // Detect touch device
  useEffect(() => {
    const detectTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0,
      );
    };

    detectTouch();
  }, []);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  // total swipe distance depending of number of actions defined
  let totalSwipeDistance = action1 ? 50 : 0;
  totalSwipeDistance += action2 ? 50 : 0;
  totalSwipeDistance += action3 ? 50 : 0;

  // Count total actions to determine positions (rightmost appears first)
  const actionCount = (action1 ? 1 : 0) + (action2 ? 1 : 0) + (action3 ? 1 : 0);

  // Get position from right (action3 is 0, action2 is 1, action1 is 2)
  const getActionPosition = (actionNum: 1 | 2 | 3): number => {
    if (actionNum === 3 && action3) return 0;
    if (actionNum === 2 && action2) return action3 ? 1 : 0;
    if (actionNum === 1 && action1) {
      let pos = 0;
      if (action3) pos++;
      if (action2) pos++;
      return pos;
    }
    return 0;
  };

  // Calculate scale for each icon based on swipe distance
  // Position 0 is rightmost (appears first), position 2 is leftmost (appears last)
  const getIconScale = (position: number, swipeDistance: number): number => {
    const iconStartDistance = position * 50;
    const iconEndDistance = (position + 1) * 50;

    if (swipeDistance <= iconStartDistance) {
      return 0; // Completely invisible
    } else if (swipeDistance >= iconEndDistance) {
      return 1.0; // Fully visible
    } else {
      // Proportional between 0 and 1.0
      const progress = (swipeDistance - iconStartDistance) / 50;
      return progress;
    }
  };

  const getCurrentSwipeDistance = (): number => {
    if (!touchStart || !touchEnd) {
      return isOpen ? totalSwipeDistance : 0;
    }
    const distance = Math.min(Math.max(touchStart - touchEnd, 0), totalSwipeDistance);
    return distance;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setSwiping(true);
    setTouchEnd(e.targetTouches[0].clientX);

    const currentDistance = e.targetTouches[0].clientX;
    if (touchStart) {
      const swipeDistance = touchStart - currentDistance;

      // Trigger bounce when icon reaches full size (rightmost first)
      const action3Pos = getActionPosition(3);
      const action2Pos = getActionPosition(2);
      const action1Pos = getActionPosition(1);

      if (action3 && swipeDistance >= (action3Pos + 1) * 50 && !action3Bounced) {
        setAction3Bounced(true);
      }
      if (action2 && swipeDistance >= (action2Pos + 1) * 50 && !action2Bounced) {
        setAction2Bounced(true);
      }
      if (action1 && swipeDistance >= (action1Pos + 1) * 50 && !action1Bounced) {
        setAction1Bounced(true);
      }

      // Reset bounce when swiping back
      if (action3 && swipeDistance < (action3Pos + 1) * 50 && action3Bounced) {
        setAction3Bounced(false);
      }
      if (action2 && swipeDistance < (action2Pos + 1) * 50 && action2Bounced) {
        setAction2Bounced(false);
      }
      if (action1 && swipeDistance < (action1Pos + 1) * 50 && action1Bounced) {
        setAction1Bounced(false);
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setIsOpen(true);
      setOpenItemId(keyId); // Notify context that this item is now open
      // Trigger bounce for all fully visible icons
      const action3Pos = getActionPosition(3);
      const action2Pos = getActionPosition(2);
      const action1Pos = getActionPosition(1);

      if (action3 && distance >= (action3Pos + 1) * 50) setAction3Bounced(true);
      if (action2 && distance >= (action2Pos + 1) * 50) setAction2Bounced(true);
      if (action1 && distance >= (action1Pos + 1) * 50) setAction1Bounced(true);
    } else if (distance < -minSwipeDistance) {
      setIsOpen(false);
      setOpenItemId(null); // Notify context that no item is open
      setAction1Bounced(false);
      setAction2Bounced(false);
      setAction3Bounced(false);
    }

    setSwiping(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  /**
   * Triggers the action and ensure swipe is closed on this swipeable list item 
   * @param action the action to execute
   */
  const onActionClick = (action: () => void) => {
    setIsOpen(false);
    action();
  }

  const getSwipeDistance = () => {
    if (!touchStart || !touchEnd) return 0;
    return touchStart - touchEnd;
  };

  const getTransform = () => {
    if (isOpen) {
      return `translateX(-${totalSwipeDistance}px)`;
    }

    if (!swiping) {
      return 'translateX(0)';
    }

    const distance = Math.min(Math.max(getSwipeDistance(), 0), totalSwipeDistance);
    return `translateX(-${distance}px)`;
  };

  const toggleOpen = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setOpenItemId(newIsOpen ? keyId : null); // Notify context
    if (newIsOpen) {
      if (action1) setAction1Bounced(true);
      if (action2) setAction2Bounced(true);
      if (action3) setAction3Bounced(true);
    } else {
      setAction1Bounced(false);
      setAction2Bounced(false);
      setAction3Bounced(false);
    }
  };

  // Click away handler
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const card = document.getElementById(`card-${primaryText}`);
      if (card && !card.contains(target)) {
        setIsOpen(false);
        setOpenItemId(null); // Notify context
        setAction1Bounced(false);
        setAction2Bounced(false);
        setAction3Bounced(false);
      }
    };

    document.addEventListener('click', handleClickAway);
    return () => {
      document.removeEventListener('click', handleClickAway);
    };
  }, [primaryText]);

  // One swipe action button (iOS 27 filled circle), scaled in as the row is swiped.
  const renderAction = (
    action: SwipeableListItemAction,
    index: 1 | 2 | 3,
    scale: number,
    bounced: boolean,
  ) => (
    <IconButton
      key={`action${index}-${bounced}`}
      onClick={(_evt) => onActionClick(action.onAction)}
      aria-label={action.ariaLabel ?? `action ${index}`}
      sx={{
        ...swipeActionSx(theme, action.color),
        transform: `scale(${scale})`,
        opacity: scale,
        animationName: bounced ? `${bounceIn}` : 'none',
        animationDuration: bounced ? '0.4s' : '0s',
        animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        animationFillMode: 'forwards',
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        // Glyphs inherit the white foreground, whatever colour the caller set.
        '& .MuiSvgIcon-root': { color: '#ffffff' },
      }}
    >
      {action.icon}
    </IconButton>
  );

  const currentSwipeDistance = getCurrentSwipeDistance();
  const action1Scale = getIconScale(getActionPosition(1), currentSwipeDistance);
  const action2Scale = getIconScale(getActionPosition(2), currentSwipeDistance);
  const action3Scale = getIconScale(getActionPosition(3), currentSwipeDistance);

  return (
    <SwipeableCard id={`card-${keyId}`}>
      <ActionsWrapper>
        {action1 && renderAction(action1, 1, action1Scale, action1Bounced)}
        {action2 && renderAction(action2, 2, action2Scale, action2Bounced)}
        {action3 && renderAction(action3, 3, action3Scale, action3Bounced)}
      </ActionsWrapper>
      <CardWrapper
        transform={getTransform()}
        sx={{
          // On touch devices: a thin accent bar on the right edge signals that
          // the row can be swiped to reveal actions (iOS has no visible
          // affordance, but users of this app rely on it). On desktop the "…"
          // button serves as the affordance instead.
          boxShadow: (isTouchDevice && totalSwipeDistance > 0)
            ? `inset -3px 0 0 0 ${theme.palette.primary.main}`
            : 'none',
        }}
        {...(isTouchDevice
          ? {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
          }
          : {})}
        secondaryAction={
          (rightContent || (!isTouchDevice && totalSwipeDistance > 0)) ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {rightContent}
              {!isTouchDevice && totalSwipeDistance > 0 && (
                <IconButton onClick={toggleOpen} aria-label="actions" sx={{ color: 'text.secondary' }}>
                  <MoreHorizIcon />
                </IconButton>
              )}
            </Box>
          ) : undefined
        }
      >
        <ListItemButton
          autoFocus={false}
          sx={{
            width: '100%',
            minWidth: 0,
            // Reserve right padding when a secondary action is visible (either
            // the favourite icon on touch, or the MoreVert button on desktop).
            pr: (rightContent || (!isTouchDevice && totalSwipeDistance > 0)) ? 6 : 0,
          }}
          onClick={(_e) => {
            if (onClickMain) onClickMain();
          }}
        >
          {icon && (
            <ListItemAvatar sx={{ minWidth: iconTint === 'none' ? 56 : 48 }}>
              {iconTint === 'none' ? (
                icon
              ) : (
                // iOS Settings-style icon tile: coloured fill, white glyph, 8px radius
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: iconTint ?? 'primary.main',
                    color: '#ffffff',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                >
                  {icon}
                </Avatar>
              )}
            </ListItemAvatar>
          )}
          <ListItemText
            primary={primaryText}
            secondary={secondaryText}
            sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
          />
        </ListItemButton>
      </CardWrapper>
    </SwipeableCard>
  );
};

export default SwipeableListItem;
