import { Box, CardContent, styled, Typography } from "@mui/material";
import { Card } from "../Card";
import FacebookLikeCircularProgress from "./FacebookLikeCircularProgress";
import { ReactElement } from "react";

const EmptyListContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4),
}));

export type EmptyStateCardProps = {
  title: string;
  caption: string;
  icon?: ReactElement
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ title, caption, icon }) => {
  return (
    <EmptyListContainer>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon && (
            <Box margin="10px">
              {icon}
            </Box>
          )}
          <Box margin="10px">
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {caption}
            </Typography>
          </Box>
        </div>
      </CardContent>
    </EmptyListContainer>
  );
}

export default EmptyStateCard;

