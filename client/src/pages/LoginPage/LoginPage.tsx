import Meta from "@/components/Meta";
import SignInCard from "@/components/SignInCard";
import { CenteredFlexBox } from "@/components/styled";
import { Box, Stack, Typography } from "@mui/material";


function LoginPage() {
    return (
        <>
            <Meta title="Welcome" />
            <Box sx={{
                backgroundColor: 'transparent', // Set the background color to transparent
                backgroundImage: 'url(./background/kdolist-1.jpeg)', // Set the background image
                backgroundSize: 'cover', // Set the background image size to cover the entire component
                backgroundPosition: 'center',
                height: { xs: '100%', md: '100%' },
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
                        <SignInCard />
                    </Stack>
                </Stack>
            </Box>
        </>

    )
}

export default LoginPage;