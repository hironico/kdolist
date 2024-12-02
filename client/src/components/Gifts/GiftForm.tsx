import React, { useContext, useEffect, useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Gift, GiftLink, LoginContext } from '@/LoginContext';
import { FullSizeCenteredFlexBox } from '../styled';
import GiftLinksMenu from './GiftLinksMenu';
import { apiBaseUrl } from '@/config';
import { Stack } from '@mui/system';

interface GiftFormProps {
  gift: Gift;
  onSave: (updatedGift: Gift) => void;
  editable: boolean;
}

const GiftForm: React.FC<GiftFormProps> = ({ gift, onSave, editable }) => {
  const [updatedGift, setUpdatedGift] = useState(gift);
  const [links, setLinks] = useState<GiftLink[]>([]);

  const appContext = useContext(LoginContext);

  const postLinks = (links: GiftLink[]) => {
    console.debug('Posting links for gift : ' + gift.id + '\n' + JSON.stringify(links));

    fetch(`${apiBaseUrl}/gift/links/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appContext.loginInfo.jwt}`
      },
      body: JSON.stringify(links)
    }).then(response => {
        if (!response.ok) {
          console.error('Could not save the gift links. Status code: ', response.status);
        }
    }).catch(error => {
      console.error('Cannot save the links for gift ', gift.id, error);
    });
  };

  const fetchLinks = () => {
    console.debug('Fetching links for gift : ' + gift.id);
    if (!gift.id) {
      return;
    }

    fetch(`${apiBaseUrl}/gift/links/${gift.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${appContext.loginInfo.jwt}`
      }
    }).then(response => {
        if (!response.ok) {
          console.error('Could not fetch the gift links. Status code: ', response.status);
          setLinks([]);
        } else {
          return response.json();
        }
    }).then(linksData => {
      setLinks(linksData);
    }).catch(error => {
      console.error('Cannot fetch links for gift ', gift.id, error);
      setLinks([]);
    });
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddLink = (link: GiftLink) => { 
    link.giftId = updatedGift.id;   
    links.push(link);
    setLinks(links);
    postLinks(links);
  }

  const handleRemoveLink = (link: GiftLink) => {
    const newLinks = links.filter(l => l.id !== link.id);
    setLinks(newLinks);
  }

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
        <Carousel sx={{width: '100%'}}>
          {images.map((oneImg, index) => {
            return <FullSizeCenteredFlexBox key={`box-img-key-${index}`}>              
              <Box sx={{background: `url(${oneImg.src})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '250px', height: '250px' }} key={`gift-img-key-${index}`} />
            </FullSizeCenteredFlexBox>            
          })
          }
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
        <GiftLinksMenu links={links} handleAddLink={handleAddLink} handleRemoveLink={handleRemoveLink} editable={editable}/>
        <Button disabled={!editable} variant="contained" color="primary" onClick={() => onSave(updatedGift)} sx={{ marginTop: '10px' }}>
          Enregistrer
        </Button> 
      </Stack>

    </form>
  );
};

export default GiftForm;