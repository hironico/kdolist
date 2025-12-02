import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { styled } from '@mui/material/styles';
import Meta from '@/components/Meta';
import { useNavigate } from 'react-router-dom';
import { LoginButton } from '@/components/SignInCard';
import { StatsCard } from '@/components/StatsCard';
import theme from '@/store/theme';

interface CarouselItem {
  image: string;
  title: string;
  description: string;
}

const CarouselContainer = styled(Box)(() => ({
  position: 'relative',
  backgroundColor: 'transparent',
  minHeight: '55vh',
}));

const CarouselSlide = styled(Paper)(({ theme }) => ({
  height: '50vh',
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  color: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    //backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
}));

const SlideContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  padding: theme.spacing(2),
  backdropFilter: 'blur(5px) saturate(200%)',
  backgroundColor: 'rgba(17,25,40,0.5)',
  borderRadius: '12px',
  border: '1px solid rgba(209, 213, 219, 0.3)',
  width: '75%',
  maxWidth: '75%', // Mobile default
  [theme.breakpoints.up('md')]: {
    maxWidth: '33%', // Desktop
  },
}));

const carouselItems: CarouselItem[] = [
  {
    image: './background/kdolist-1.jpeg',
    title: 'K.DO-List!',
    description: 'Bienvenue sur K.DO-List ! Notre nouvelle façon de partager nos listes de cadeaux.',
  },
  {
    image: './background/kdolist-2.jpeg',
    title: 'Crée ta première liste',
    description: 'K.DO-LIST gère tes listes de cadeaux. Partages les avec ta famille, tes amis, ta tribu!',
  },
  {
    image: './background/kdolist-3.jpeg',
    title: 'Comment ca marche ?',
    description: 'Utilises un réseau social pour t\'inscrire, c\'est le plus simple. Tu n\'es pas sur les réseaux? Alors remplis le formulaire d\'inscription.',
  },
  {
    image: './background/kdolist-4.jpeg',
    title: 'Enfin prêt pour le mobile',
    description: 'Ranges ton téléscope, K.DO-LIST est adapté pour l\'affichage sur mobile.',
  },
  {
    image: './background/kdolist-5.jpeg',
    title: 'Un petit bonus ?',
    description: 'Le compte hironico.net permet aussi d\'utiliser Nico\'s Drive ! 5 GB gratuits, mais si tu demandes gentilment, on te donne plus.',
  }
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const onLetsGo = () => {
    navigate('/login', { replace: true });
  };

  const onLetsGoPrivacy = () => {
    navigate('/privacy', { replace: true });
  };

  return (
    <>
      <Meta title="Welcome" />
      <Container sx={{ pb: 1, overflowY: 'scroll', height: '100%', width: '100%' }}>
        <CarouselContainer>
          <Carousel
            animation="slide"
            indicators={true}
            navButtonsAlwaysVisible={true}
            cycleNavigation={true}
            fullHeightHover={true}
            sx={{ height: '55vh' }}
          >
            {carouselItems.map((item, index) => (
              <CarouselSlide
                key={index}
                sx={{
                  backgroundImage: `url(${item.image})`,
                }}
              >
                <SlideContent>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {item.description}
                  </Typography>
                </SlideContent>
              </CarouselSlide>
            ))}
          </Carousel>
        </CarouselContainer>

        <LoginButton variant="contained" text="Commencer" />

        <StatsCard />

        <Button
          variant="text"
          color="secondary"
          size="small"
          sx={{ mt: 2, width: '100%', textAlign: 'center', justifyContent: 'center', }}
          onClick={(_e) => onLetsGoPrivacy()}
        >
          Politique de confidentialité
        </Button>
      </Container>
    </>
  );
};

export default Welcome;
