import { Box, CircularProgress, circularProgressClasses, CircularProgressProps } from "@mui/material";

export default function FacebookLikeCircularProgress(props: CircularProgressProps) {
    return (
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          variant="determinate"
          sx={(theme) => ({
            color: theme.palette.action.selected,
          })}
          size={40}
          thickness={4}
          {...props}
          value={100}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          sx={(theme) => ({
            color: theme.palette.primary.main,
            animationDuration: '550ms',
            position: 'absolute',
            left: 0,
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: 'round',
            },
          })}
          size={40}
          thickness={4}
          {...props}
        />
      </Box>
    );
  }