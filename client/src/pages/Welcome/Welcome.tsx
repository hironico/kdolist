import Meta from '@/components/Meta';
import Content from './Content';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useContext } from 'react';
import { LoginContext } from '@/LoginContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, Link, Typography } from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';

function Welcome() {
  // const isPortrait = useOrientation();
  const loginContext = useContext(LoginContext);

  const navigate = useNavigate();
  const onLetsGo = () => {
    navigate('/login', { replace: true });
  }

  /*
  const width = isPortrait ? '40%' : '30%';
  const height = isPortrait ? '30%' : '40%';
  */

  const welcomePage = (
    <>
      <Meta title="Welcome" />
      <Box sx={{
        backgroundColor: 'transparent', // Set the background color to transparent
        backgroundImage: 'url(./background/kdolist-1.jpeg)', // Set the background image
        backgroundSize: 'cover', // Set the background image size to cover the entire component
        backgroundPosition: 'center',
        height: { xs: '100%', md: '100%' }
      }}>
        <Stack
          direction="column"
          component="main"
          sx={[
            {
              justifyContent: 'space-between',
              height: { xs: 'auto', md: '100%' },
            },
          ]}
        >
          <CenteredFlexBox>
            <Typography variant='h2' color="lightgray">K.DO-List</Typography>
          </CenteredFlexBox>
          <Content />
          <Button variant='contained' onClick={(_evt) => onLetsGo()} sx={{marginLeft: '15px', marginRight: '15px', padding: '15px'}}>C&apos;est parti !</Button>

          <Card sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // White background with 20% opacity
            backdropFilter: 'blur(10px)', // Blur effect
            marginLeft: '15px',
            marginRight: '15px'
          }}>
            <CenteredFlexBox sx={{padding: '15px'}}>
              <a href='https://kdolist.hironico.net/legal/privacy' target='_blank'>Politique de confidentialite</a>
            </CenteredFlexBox>
          </Card>
        </Stack>
      </Box>
    </>
  );

  return loginContext.loginInfo.jwt != '' ? <Navigate to="/mylists" replace /> : welcomePage;
}

export default Welcome;