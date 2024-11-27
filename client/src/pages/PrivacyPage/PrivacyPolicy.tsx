import { Typography, Box } from '@mui/material';

const PrivacyPolicy = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Déclaration de Confidentialité
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}}>
                Informations que nous collectons
            </Typography>

            <ul>
                <li>Adresse email</li>
                <li>Nom</li>
                <li>Prénom</li>
            </ul>

            <Typography variant="h5" sx={{fontWeight: 600}}>
                Utilisation des informations
            </Typography>
            <Typography variant="body1" gutterBottom>
                Ces informations sont utilisées uniquement pour identifier les utilisateurs et leur permettre d&apos;accéder aux fonctionnalités du site web.
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}} gutterBottom>
                Protection des informations
            </Typography>

            <Typography variant="body1" gutterBottom>
                Les informations personnelles collectées sont sauvegardées dans une base de données sécurisée qui n&apos;est accessible qu&apos;à un nombre limité de personnes autorisées. Nous prenons toutes les mesures nécessaires pour protéger vos données contre toute perte, utilisation abusive ou accès non autorisé.
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}} gutterBottom>
                Accès et modification des informations
            </Typography>

            <Typography variant="body1" gutterBottom>
                Vous pouvez accéder à vos informations personnelles à tout moment et les modifier si nécessaire. Veuillez contacter notre équipe support pour toute demande d&apos;accès, de modification ou de suppression de vos données.
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}} gutterBottom>
                Cookies
            </Typography>

            <Typography variant="body1" gutterBottom>
                Ce site web utilise des cookies pour améliorer votre expérience utilisateur. Les cookies sont de petits fichiers texte qui sont stockés sur votre ordinateur. Ils nous permettent de vous reconnaître lorsque vous revenez sur notre site web et de personnaliser votre expérience. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais cela peut affecter certaines fonctionnalités du site web.
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}} gutterBottom>
                Liens vers d&apos;autres sites
            </Typography>


            <Typography variant="body1" gutterBottom>
                Ce site web peut contenir des liens vers d&apos;autres sites web. Nous ne sommes pas responsables de la politique de confidentialité de ces sites web. Nous vous encourageons à consulter la déclaration de confidentialité de chaque site web que vous visitez.
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}} gutterBottom>
                Modifications de la déclaration de confidentialité
            </Typography>

            <Typography variant="body1" gutterBottom>
                Nous nous réservons le droit de modifier cette déclaration de confidentialité à tout moment. Les modifications seront publiées sur ce site web. Nous vous encourageons à consulter régulièrement cette page pour vous tenir au courant de nos pratiques en matière de confidentialité.
            </Typography>

            <Typography variant="h5" sx={{fontWeight: 600}} gutterBottom>
                Contactez-nous
            </Typography>

            <Typography variant="body1" gutterBottom>
                Si vous avez des questions concernant cette déclaration de confidentialité, veuillez nous contacter à l&apos;adresse suivante : [adresse email].
            </Typography>
        </Box>
    );
};

export default PrivacyPolicy;