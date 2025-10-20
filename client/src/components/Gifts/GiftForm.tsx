import React, { useCallback, useContext, useEffect, useState } from 'react';
import { TextField, Box, Chip } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Gift, GiftImage, GiftLink, LoginContext } from '@/LoginContext';
import { FullSizeCenteredFlexBox } from '../styled';
import BottomDialog, { BottomDialogAction } from '../BottomDialog/BottomDialog';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckIcon from '@mui/icons-material/Check';
import useNotifications from '@/store/notifications';

import { apiBaseUrl } from '@/config';
import { useNavigate } from 'react-router-dom';

interface GiftFormProps {
  gift: Gift;
  editable: boolean;
  open: boolean;
  onClose: (refresh: boolean) => void;
}

const defaultImages: GiftImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1482175828271-d793f8c731b2',
    createdAt: new Date(),
    updatedAt: new Date(),
    giftId: ''
  },
  {
    url: 'https://images.unsplash.com/photo-1634038036367-7c0e7a95fa4c',
    createdAt: new Date(),
    updatedAt: new Date(),
    giftId: ''
  },
  {
    url: 'https://images.unsplash.com/photo-1511895654441-f6a0e1db5cbd',
    createdAt: new Date(),
    updatedAt: new Date(),
    giftId: ''
  },
];

const GiftForm: React.FC<GiftFormProps> = ({ gift, editable, open, onClose }) => {
  const [updatedGift, setUpdatedGift] = useState<Gift>(gift);

  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  const navigate = useNavigate();

  useEffect(() => {
    setUpdatedGift(gift);
  }, [gift]);

  const showError = useCallback((message: string) => {
    notificationsActions.push({
      options: {
        variant: 'error',
      },
      message: message,
    });
  }, []);

  const handleSaveGift = (giftToSave: Gift) => {
    if (!appContext.giftList || !editable) {
      console.error('When calling handleSaveGift, the gift list must be set in app context and the gift must be editable.');
      onClose(false);
      return;
    }

    giftToSave.giftListId = appContext.giftList.id;

    fetch(`${apiBaseUrl}/gift/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
      body: JSON.stringify(giftToSave),
    }).then((response) => {
      if (!response.ok) {
        console.error(JSON.stringify(response));
        showError(`Impossible de sauvegarder la liste pour le moment.`);
      }

      // close this dialog after save is performed
      onClose(true);
    });
  };

  const handleAddLink = (link: GiftLink) => {
    link.giftId = updatedGift.id;
    const newLinks = updatedGift.links ? [...updatedGift.links, link] : [link];
    setUpdatedGift({ ...updatedGift, links: newLinks });
  };

  const handleRemoveLink = (link: GiftLink) => {
    if (!updatedGift.links || !editable) {
      return;
    }

    const newLinks = updatedGift.links.filter((l) => l.id !== link.id);
    setUpdatedGift({ ...updatedGift, links: newLinks });
  };

  const handleAddImage = (imgUrl: string) => {
    const newImg: GiftImage = {
      url: imgUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      giftId: updatedGift.id
    };
    const newImages = [...updatedGift.images, newImg];
    setUpdatedGift({ ...updatedGift, images: newImages });
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedGift({ ...updatedGift, [event.target.name]: event.target.value });
  };

  const handleMagicPaste = () => {
    if (!editable) {
      return;
    }

    try {
      navigator.clipboard.read()
        .then(items => {
          for (let i = 0; i < items.length; i++) {
            const item: ClipboardItem = items[i];
            console.log(`clip board item: ${JSON.stringify(item.types)}`);

            for (let j = 0; j < item.types.length; j++) {
              const theType = item.types[j];
              console.log('Reading clipboard item type: ' + theType);

              if (theType.startsWith('text')) {
                navigator.clipboard.readText()
                  .then((plainData) => {
                    if (!plainData.startsWith('https')) {
                      console.log(`Did not received a https url from paste: ${plainData}`);
                      return;
                    }

                    console.log(`Creating new link...`);
                    const hostname = new URL(plainData).host;
                    const newLink: GiftLink = {
                      id: '',
                      description: hostname ? hostname : `Lien ${updatedGift.links.length + 1}`,
                      url: plainData,
                      giftId: updatedGift.id,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    }

                    handleAddLink(newLink);
                  })

              } else {

                item.getType(theType)
                  .then(blob => {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                      const data: string = e.target?.result as string;
                      console.log(`Data found for ${theType} : ${data}`);
                      if (theType.startsWith('image')) {
                        handleAddImage(data);
                      }
                    };
                    if (theType.startsWith('image')) {
                      fileReader.readAsDataURL(blob);
                    }
                  }).catch(error => console.log('Error while reading clipboard type:' + theType + '. Error: ' + error));

              }
            }
          }
        });
    } catch (error) {
      console.error('Error pasting image:', error);
    }
  };

  const handleRedirect = (url: string) => {    
    navigate(`/redirect?url=${encodeURI(url)}&newTab=true`);
  }

  const images: GiftImage[] = updatedGift.images.length === 0 ? defaultImages : updatedGift.images;

  const actions: BottomDialogAction[] = [
    {
      icon: <AutoFixHighIcon />,
      label: 'Coller',
      onClick: handleMagicPaste
    },
    {
      icon: <CheckIcon />,
      label: 'OK',
      onClick: () => handleSaveGift(updatedGift)
    }
  ];

  const contents = <Box component="form" sx={{ marginBottom: '20px' }}>
    <Carousel sx={{ width: '100%' }}>
      {images.map((oneImg, index) => {
        return (
          <FullSizeCenteredFlexBox key={`box-img-key-${index}`}>
            <Box
              sx={{
                background: `url('${oneImg.url}')`,
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

    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, mt: 2}}>
      {updatedGift.links?.map((link) => (
      <Chip
          key={link.id}
          label={link.description}
          onDelete={() => handleRemoveLink(link)}
          onClick={() => handleRedirect(link.url)}
          color='primary'
          variant='filled'          
          sx={{
            '&:hover': 'rgba(0, 0, 0, 0.04)'
          }}
        />
      ))}
    </Box>
  </Box>

  return (
    <BottomDialog open={open}
      handleClose={() => onClose(false)}
      title={'Editer...'}
      actions={actions}
      contents={contents} />
  );
};

export default GiftForm;
