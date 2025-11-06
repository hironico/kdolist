import Meta from '@/components/Meta';
import SignInCard from '@/components/SignInCard';
import { CenteredVerticalFlexBox } from '@/components/styled';
import { Box, Stack, Typography } from '@mui/material';

function LoginPage() {

  const randomBgImageUrl = `url("./background/kdolist-${Math.floor((Math.random() * 4) + 1)}.jpeg")`;

  console.log(randomBgImageUrl);

  return (
    <>
      <Meta title="Welcome" />
      <Box
        sx={{
          backgroundColor: 'transparent', // Set the background color to transparent
          backgroundImage: randomBgImageUrl, // Set the background image
          backgroundSize: 'cover', // Set the background image size to cover the entire component
          backgroundPosition: 'center',
          height: { xs: '100%', md: '100%' },
        }}
      >
        <Stack
          direction="column"
          component="main"
          sx={[
            {
              justifyContent: 'center',
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
            <CenteredVerticalFlexBox>
              <Typography variant="h2" color="lightgray">
                K.DO-List
              </Typography>
              <Typography variant='subtitle2' color="lightgray">
                Il faut se connecter pour ouvrir K.DO-List.
              </Typography>
            </CenteredVerticalFlexBox>
            <SignInCard />
          </Stack>
        </Stack>
      </Box>
    </>
  );
}

export default LoginPage;
