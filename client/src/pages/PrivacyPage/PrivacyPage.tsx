import Meta from "@/components/Meta";
import PrivacyPolicy from "./PrivacyPolicy";
import { Box } from "@mui/system";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";


function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <>
            <Meta title="Politique de confidentialité"/>
            <Box sx={{
                backgroundColor: 'rgba(255,255,255, 0.65)',
                boxShadow: 'none',
                backdropFilter: 'blur(10px)',
                height: { xs: '100%', md: '100%' },
                padding: '15px'
            }}>
                <Stack>
                    <PrivacyPolicy/>
                    <Button variant="contained" sx={{marginTop: '15px', marginBottom: '15px'}} onClick={(_e) => navigate('/', {replace: true})}>Retour</Button>
                </Stack>
                
            </Box>
        </>        
    )
}

export default PrivacyPage;