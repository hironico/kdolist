import Meta from '@/components/Meta';
import Content from './Content';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useContext } from 'react';
import { LoginContext } from '@/LoginContext';
import { Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';

function Welcome() {
  // const isPortrait = useOrientation();
  const loginContext = useContext(LoginContext);

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
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              justifyContent: 'center',
              gap: { xs: 6, sm: 12 },
              p: { xs: 2, sm: 4 },
              m: 'auto',
            }}
          >            
            <CenteredFlexBox>
              <Typography variant='h2' color="lightgray">K.DO-List</Typography>
            </CenteredFlexBox>            
            <Content />            
          </Stack>
        </Stack>
      </Box>
    </>
  );

  return loginContext.loginInfo.jwt != '' ? <Navigate to="/mylists" replace /> : welcomePage;
}

export default Welcome;