import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import QuestionAnswer from '@mui/icons-material/QuestionAnswer';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import Card from '@/components/Card/Card';
import { Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CenteredFlexBox, FlexBox } from '@/components/styled';

const items = [
  {
    icon: <QuestionAnswer fontSize="small" sx={{ color: 'text.secondary' }} />,
    title: 'Bienvenue!',
    description:
      'L\'application K.DO-LIST permet de partager ses listes de cadeaux, pour soi-même ou quelqu\'un d\'autre.',
  },
  {
    icon: <PsychologyAltIcon sx={{ color: 'text.secondary' }} />,
    title: 'Comment ça marche?',
    description:
      'Utilises un réseau social pour te faire connaitre, puis crées ta premiere liste. Tu n\'es pas sur les réseaux? \
      Fais-le nous savoir et on s\'occuppe de tout.'
  },
  {
    icon: <ThumbUpAltRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Enfin prêt pour le mobile',
    description:
      'Ranges ton téléscope, K.DO-LIST est adapté pour l\'affichage sur mobile.',
  },
  {
    icon: <AutoFixHighRoundedIcon sx={{ color: 'text.secondary' }} />,
    title: 'Une fonctionnalité manque?',
    description:
      'On a déjà plein d\'idées et si peu de temps pour les mettre en place, mais parles-en dans le chat et on va voir ce qu\'on peut faire, rien que pour toi.',
  },
];

export default function Content() {
  // const [theme] = useTheme();
  // const bgColor = theme === Themes.DARK ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.7)';

  const bgColor = 'rgba(255, 255, 255, 0.7)';
  

  return (
    <Stack sx={{ flexDirection: {xs: 'column', sm: 'row'}, alignSelf: 'center', gap: 4, maxWidth: 1150 }}>
      {items.map((item, index) => (
          <Card variant="outlined" key={`contentcard-${index}`}
          sx={{
            backgroundColor: bgColor, // White background with 20% opacity
            backdropFilter: 'blur(10px)', // Blur effect
            padding: '20px', // Add some padding
            height: '250px',
            width: '250px',
          }}>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={2}>{item.icon}</Grid>
              <Grid item xs={8}>{item.title}</Grid>
            </Grid>
            <Typography fontSize="medium" sx={{ color: 'text.primary' }}>
            {item.description}
            </Typography>
          </Card>
      ))}      
    </Stack>
  );
}