import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import QuestionAnswer from '@mui/icons-material/QuestionAnswer';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import useTheme from '@/store/theme';
import { Themes } from '@/theme/types';
import Card from '@/components/Card/Card';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const items = [
  {
    icon: <QuestionAnswer sx={{ color: 'text.secondary' }} />,
    title: 'Bienvenue!',
    description:
      'L\'application K.DO-LIST permet de partager ses listes de cadeaux, pour soi-même ou quelqu\'un d\'autre.',
  },
  {
    icon: <PsychologyAltIcon sx={{ color: 'text.secondary' }} />,
    title: 'Comment ça marche?',
    description:
      'Utilises un réseau social pour te faire connaitre, puis crées ta premiere liste et cherches un groupe avec qui la partager. Tu n\'est pas sur les réseaux? \
      Comme tu es quelqu\'un de très spécial on va te créer un compte avec un mot de passe. Fais-le nous savoir et on s\'en occuppe.'
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
  const [theme] = useTheme();
  // const bgColor = theme === Themes.DARK ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.7)';
  const bgColor = 'rgba(255, 255, 255, 0.7)';
  const navigate = useNavigate();

  const onLetsGo = () => {
    navigate('/login', { replace: true});
  }

  return (
    <Card variant="outlined" sx={{
      backgroundColor: bgColor, // White background with 20% opacity
      backdropFilter: 'blur(10px)', // Blur effect
      padding: '20px', // Add some padding
    }}>
      <Stack
        sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
      >
        {items.map((item, index) => (
          <Stack key={index} direction="row" sx={{ gap: 2 }}>
            {item.icon}
            <div>
              <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                {item.title}
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>
                {item.description}
              </Typography>
            </div>
          </Stack>
        ))}

        <Button variant='contained' onClick={(evt) => onLetsGo()}>C'est parti !</Button>
      </Stack>
    </Card>
  );
}