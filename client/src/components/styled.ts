import { Fab, ListItem } from '@mui/material';
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

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

export { FlexBox, CenteredFlexBox, FullSizeCenteredFlexBox, TopCenteredFlexBox, FullSizeTopCenteredFlexBox, StyledFab };
