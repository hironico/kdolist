import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const FlexBox = styled(Box)({
  display: 'flex',
});

const CenteredFlexBox = styled(FlexBox)({
  justifyContent: 'center',
  alignItems: 'center',
});

const FullSizeCenteredFlexBox = styled(CenteredFlexBox)({
  width: '100%',
  height: '100%',
});

const TopCenteredFlexBox = styled(FlexBox)({
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const FullSizeTopCenteredFlexBox = styled(TopCenteredFlexBox)({
  width: '100%',
  height: '100%',
});

const VerticalFlexBox = styled(FlexBox) ({
  flexDirection: 'column',
});

const CenteredVerticalFlexBox = styled(VerticalFlexBox) ({
  justifyContent: 'center',
  alignItems: 'center'
})

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

/**
 * sx for a MUI <List> placed inside a container that already scrolls.
 *
 * The theme makes every List scroll on its own (maxHeight: 100%, overflowY:
 * auto). Nested in a scroll area this creates a second scrollbar, so the list
 * must grow to its content instead. `overflow: hidden` keeps the rounded
 * corners / swipe clipping (overflowX alone would turn overflowY back to auto).
 */
const nestedListSx = {
  maxHeight: 'none',
  overflow: 'hidden',
} as const;

export {
  nestedListSx,
  FlexBox,
  CenteredFlexBox,
  FullSizeCenteredFlexBox,
  TopCenteredFlexBox,
  FullSizeTopCenteredFlexBox,
  VerticalFlexBox,
  CenteredVerticalFlexBox,
  StyledFab,
};
