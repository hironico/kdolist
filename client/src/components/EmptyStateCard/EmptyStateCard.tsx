import { Box, Typography } from "@mui/material";
import { ReactElement } from "react";

export type EmptyStateCardProps = {
  title: string;
  caption: string;
  icon?: ReactElement
}

/**
 * iOS "content unavailable" view: large grey symbol, bold title and a
 * secondary description, centred, without a card around it.
 */
const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ title, caption, icon }) => {
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1,
        px: 4,
        py: 6,
        mx: 'auto',
        maxWidth: 420,
      }}
    >
      {icon && (
        <Box
          sx={{
            color: 'text.secondary',
            mb: 1,
            display: 'flex',
            '& .MuiSvgIcon-root': { fontSize: 56 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="p">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {caption}
      </Typography>
    </Box>
  );
}

export default EmptyStateCard;

