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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  FormatListBulleted as FormatListBulletedIcon
} from '@mui/icons-material';

// Styled components
const SwipeableCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const CardWrapper = styled(ListItem)<{ transform: string, theme: Theme }>(({ transform, theme }) => ({
  display: 'flex',
  transform,
  transition: 'transform 0.3s ease-out',
  backgroundColor: theme.palette.background.paper,
  padding: '0px',
  margin: '0px'
}));

const ActionsWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
}));

export interface SwipeableListItemAction {
  icon: ReactElement;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  onAction: () => void;
}

export interface SwipeableListItemProps {
  primaryText: ReactElement | string;
  secondaryText: ReactElement | string;
  action1?: SwipeableListItemAction;
  action2?: SwipeableListItemAction;
  action3?: SwipeableListItemAction;
  onClick?: () => void;
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  primaryText,
  secondaryText,
  action1, action2, action3,
  onClick,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const theme = useTheme();

  // Detect touch device
  useEffect(() => {
    const detectTouch = () => {
      setIsTouchDevice(('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints > 0));
    };

    detectTouch();
  }, []);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  // total swipe distance depending of number of actions defined
  let totalSwipeDistance = action1 ? 50 : 0;
  totalSwipeDistance += action2 ? 50 : 0;
  totalSwipeDistance += action3 ? 50 : 0;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setSwiping(true);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setIsOpen(true);
    } else if (distance < -minSwipeDistance) {
      setIsOpen(false);
    }
    
    setSwiping(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

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
    setIsOpen(!isOpen);
  };

  // Click away handler
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const card = document.getElementById(`card-${primaryText}`);
      if (card && !card.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickAway);
    return () => {
      document.removeEventListener('click', handleClickAway);
    };
  }, [primaryText]);


  return (
    <SwipeableCard id={`card-${primaryText}`}>
      <ActionsWrapper>
        {action1 && (
          <IconButton onClick={action1.onAction} color={action1.color}>
            {action1.icon}
          </IconButton>
        )}
        {action2 && (
          <IconButton onClick={action2.onAction} color={action2.color}>
            {action2.icon}
          </IconButton>
        )}
        {action3 && (
          <IconButton onClick={action3.onAction} color={action3.color}>
            {action3.icon}
          </IconButton>
        )}
      </ActionsWrapper>      
      <CardWrapper
        transform={getTransform()}
        theme={theme}
        {...(isTouchDevice ? {
          onTouchStart,
          onTouchMove,
          onTouchEnd,
        } : {})}

        secondaryAction={!isTouchDevice && (
            <IconButton onClick={toggleOpen}>
              <MoreVertIcon />
            </IconButton>
           )}
      >
            <ListItemButton sx={{ width: '100%', pr: isTouchDevice ? 0 : 6 }} onClick={(_e) =>  {
                if(onClick) onClick();
            }}>
                <ListItemAvatar>
                <Avatar>
                  <FormatListBulletedIcon />
                </Avatar>
              </ListItemAvatar>
                <ListItemText primary={primaryText} secondary={secondaryText} />
            </ListItemButton>
      </CardWrapper>
    </SwipeableCard>
  );
};

export default SwipeableListItem;