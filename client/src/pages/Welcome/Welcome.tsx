import React, { ReactElement } from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { styled } from '@mui/material/styles';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import QuestionAnswer from '@mui/icons-material/QuestionAnswer';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import Meta from '@/components/Meta';
import { useNavigate } from 'react-router-dom';

interface CarouselItem {
    image: string;
    title: string;
    description: string;
    buttonText: string;
}

interface FeatureCard {
    icon: ReactElement;
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

const SlideContent = styled(Box)(() => ({
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent'
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
}));

const FeatureBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    height: '100%',
}));

const carouselItems: CarouselItem[] = [
    {
        image: './background/kdolist-1.jpeg',
        title: 'K.DO-List',
        description: 'Notre nouvelle façon de partager nos listes de cadeaux',
        buttonText: 'Commencer',
    },
    // Ajoutez d'autres éléments du carousel ici
];

const features: FeatureCard[] = [
    {
        icon: <QuestionAnswer fontSize="small" sx={{ color: 'text.secondary' }} />,
        title: 'C\'est quoi?',
        description:
            'K.DO-LIST gère tes listes de cadeaux. Partages les avec ta famille ou tes amis.',
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

const Welcome: React.FC = () => {

    const navigate = useNavigate();
    const onLetsGo = () => {
        navigate('/login', { replace: true });
    }

    const onLetsGoPrivacy = () => {
        navigate('/privacy', {replace: true});
    }

    return (
        <>
            <Meta title="Welcome" />
            <Container maxWidth="lg" sx={{ pb: 2, overflowY: 'scroll', height: '100%' }}>
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
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="medium"
                                        sx={{ mt: 4, width: '100%' }}
                                        onClick={(_e) => onLetsGo()}
                                    >
                                        {item.buttonText}
                                    </Button>
                                </SlideContent>
                            </CarouselSlide>
                        ))}
                    </Carousel>
                </CarouselContainer>

                <FeatureGrid>
                    {features.map((feature, index) => (
                        <FeatureBox key={index} elevation={2}>
                            <Typography variant="h1" component="div" sx={{ fontSize: '2rem', mb: 1 }}>
                                {feature.icon}
                            </Typography>
                            <Typography variant="h6" component="h2" gutterBottom>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {feature.description}
                            </Typography>
                        </FeatureBox>
                    ))}
                </FeatureGrid>
                <Button variant="contained"
                    color="primary"
                    size="medium"
                    onClick={(_e) => onLetsGo()}
                    sx={{ mt: 4, width: '100%' }}
                >
                    C&apos;est parti !
                </Button>

                <Button variant="contained"
                    color="secondary"
                    size="medium"
                    sx={{ mt: 4, width: '100%' }}
                    onClick={(_e) => onLetsGoPrivacy()}>
                    Politique de confidentialité
                </Button>
            </Container>
        </>
    );
};

export default Welcome;