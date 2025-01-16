import { CardContent, styled, Typography } from "@mui/material";
import { Card } from "../Card";

const EmptyListContainer = styled(Card)(({ theme }) => ({
    padding: theme.spacing(4),
    margin: theme.spacing(4),
  }));

export type EmptyStateCardProps = {
    title: string;
    caption: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({title, caption}) => {
    return (
        <EmptyListContainer>
        <CardContent>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {caption}
            </Typography>
          </CardContent>
      </EmptyListContainer>
    );
}

export default EmptyStateCard;

