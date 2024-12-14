import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Gift, GiftLink } from '@/LoginContext';
import { FullSizeCenteredFlexBox } from '../styled';
import GiftLinksMenu from './GiftLinksMenu';
import { Stack } from '@mui/system';

interface GiftFormProps {
  gift: Gift;
  handleSave: (updatedGift: Gift) => void;
  editable: boolean;
}

const GiftForm: React.FC<GiftFormProps> = ({ gift, handleSave, editable }) => {
  const [updatedGift, setUpdatedGift] = useState(gift);

  const handleAddLink = (link: GiftLink) => {
    link.giftId = updatedGift.id;
    if (updatedGift.links) {
      updatedGift.links.push(link);
    } else {
      const newLinks: GiftLink[] = [];
      newLinks.push(link);
      updatedGift.links = newLinks;
    }
    setUpdatedGift(updatedGift);
  };

  const handleRemoveLink = (link: GiftLink) => {
    if (!updatedGift.links) {
      return;
    }

    const newLinks = updatedGift.links.filter((l) => l.id !== link.id);
    updatedGift.links = newLinks;
    setUpdatedGift(updatedGift);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedGift({ ...updatedGift, [event.target.name]: event.target.value });
  };

  const images = [
    {
      src: 'https://images.unsplash.com/photo-1482175828271-d793f8c731b2',
      title: 'Night view',
      description: '4.21M views',
    },
    {
      src: 'https://images.unsplash.com/photo-1634038036367-7c0e7a95fa4c',
      title: 'Lake view',
      description: '4.74M views',
    },
    {
      src: 'https://images.unsplash.com/photo-1511895654441-f6a0e1db5cbd',
      title: 'Mountain view',
      description: '3.98M views',
    },
  ];

  return (
    <form>
      {/* Carousel for Images */}
      <Carousel sx={{ width: '100%' }}>
        {images.map((oneImg, index) => {
          return (
            <FullSizeCenteredFlexBox key={`box-img-key-${index}`}>
              <Box
                sx={{
                  background: `url(${oneImg.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '250px',
                  height: '250px',
                }}
                key={`gift-img-key-${index}`}
              />
            </FullSizeCenteredFlexBox>
          );
        })}
      </Carousel>

      <TextField
        label="Nom"
        name="name"
        value={updatedGift.name}
        onChange={handleInputChange}
        margin="normal"
        fullWidth
        disabled={!editable}
      />
      <TextField
        label="Description"
        name="description"
        value={updatedGift.description}
        onChange={handleInputChange}
        margin="normal"
        fullWidth
        multiline
        rows={3}
        disabled={!editable}
      />

      <Stack sx={{ width: '100%' }}>
        <GiftLinksMenu
          links={updatedGift.links}
          handleAddLink={handleAddLink}
          handleRemoveLink={handleRemoveLink}
          editable={editable}
        />
        <Button
          disabled={!editable}
          variant="contained"
          color="primary"
          onClick={() => handleSave(updatedGift)}
          sx={{ marginTop: '10px' }}
        >
          Enregistrer
        </Button>
      </Stack>
    </form>
  );
};

export default GiftForm;
