import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CenteredFlexBox, FullSizeCenteredFlexBox } from '@/components/styled';
import { giphy404, messages } from '@/config';

function NotFound() {
  return (
    <Container sx={{ height: '100%' }}>
      <FullSizeCenteredFlexBox flexDirection="column">
        <iframe
          src={giphy404}
          width="100%"
          height="50%"
          style={{ maxHeight: '60%', maxWidth: '100%' }}
          frameBorder="0"
          allowFullScreen
        />
        <CenteredFlexBox flexDirection="column" sx={{ textAlign: 'center', gap: 1, mt: 2 }}>
          <Typography variant="h4" component="h1">
            Page introuvable
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {messages[404]}
          </Typography>
        </CenteredFlexBox>
      </FullSizeCenteredFlexBox>
    </Container>
  );
}

export default NotFound;
