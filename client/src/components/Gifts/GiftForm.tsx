import React, { useCallback, useContext, useEffect, useState } from 'react';
import { TextField, Box, Chip, CircularProgress, IconButton } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Gift, GiftImage, GiftLink, LoginContext } from '@/LoginContext';
import { FullSizeCenteredFlexBox } from '../styled';
import BottomDialog, { BottomDialogAction } from '../BottomDialog/BottomDialog';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckIcon from '@mui/icons-material/Check';
import HideImageIcon from '@mui/icons-material/HideImage';
import useNotifications from '@/store/notifications';

import { apiBaseUrl } from '@/config';
import { useNavigate } from 'react-router-dom';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

interface GiftFormProps {
  gift: Gift;
  editable: boolean;
  open: boolean;
  onClose: (refresh: boolean) => void;
}

const defaultImages: GiftImage[] = [
  {
    url: '/logo_kdolist-192.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    giftId: ''
  },
];

const GiftForm: React.FC<GiftFormProps> = ({ gift, editable, open, onClose }) => {
  const [updatedGift, setUpdatedGift] = useState<Gift>(gift);
  const [isSaving, setIsSaving] = useState(false);

  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

  const navigate = useNavigate();

  const api = useAuthenticatedApi();

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

  const handleSaveGift = async (giftToSave: Gift, closeDialog: boolean) => {
    if (!appContext.giftList || !editable || isSaving) {
      console.error('When calling handleSaveGift, the gift list must be set in app context and the gift must be editable.');
      if (!isSaving) {
        onClose(false);
      }
      return;
    }

    setIsSaving(true);
    giftToSave.giftListId = appContext.giftList.id;

    console.log(`Saving gift: ${JSON.stringify(giftToSave, null, 2)}`);

    try {
      const response = await api.post(`${apiBaseUrl}/gift/`, giftToSave);

      setIsSaving(false);

      if (!response.ok) {
        console.error(JSON.stringify(response));
        showError(`Impossible de sauvegarder la liste pour le moment.`);
        return;
      }

      // close this dialog after save is performed
      // only if flag is st
      if (closeDialog) {
        onClose(true);
      } else {
        // we need to update the updatedGift otherwise we will create duplicates
        response.json().then(newGift => {
          setUpdatedGift(newGift);
        })
      }
    } catch (error) {
      console.error('Error saving gift:', error);
      showError(`Erreur lors de la sauvegarde.`);
      setIsSaving(false);
    }
  };

  const handleAddLink = (link: GiftLink) => {
    link.giftId = updatedGift.id;
    const newLinks = updatedGift.links ? [...updatedGift.links, link] : [link];
    setUpdatedGift({ ...updatedGift, links: newLinks });
  };

  const handleRemoveLink = (link: GiftLink) => {
    if (!updatedGift.links || !editable) {
      return;
    }

    const newLinks = updatedGift.links.filter((l) => l.id !== link.id);
    setUpdatedGift({ ...updatedGift, links: newLinks });
  };

  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate dimensions to fit in 250x250 while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxSize = 250;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL with reduced quality
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(resizedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = dataUrl;
    });
  };

  const handleAddImage = async (imgUrl: string) => {
    try {
      // Resize the image before adding
      const resizedUrl = await resizeImage(imgUrl);

      const newImg: GiftImage = {
        url: resizedUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        giftId: updatedGift.id
      };
      const newImages = [...updatedGift.images, newImg];
      setUpdatedGift({ ...updatedGift, images: newImages });
    } catch (error) {
      console.error('Error resizing image:', error);
      // Fallback: add original image if resize fails
      const newImg: GiftImage = {
        url: imgUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        giftId: updatedGift.id
      };
      const newImages = [...updatedGift.images, newImg];
      setUpdatedGift({ ...updatedGift, images: newImages });
    }
  }

  const handleDeleteImage = async (image: GiftImage) => {
    if (!editable || !image.id) {
      // Can't delete images without ID (not yet saved) - just remove from state
      const newImages = updatedGift.images.filter((img) => img.url !== image.url);
      setUpdatedGift({ ...updatedGift, images: newImages });
      return;
    }

    try {
      const response = await api.delete(`${apiBaseUrl}/gift/image/${image.id}`);

      if (!response.ok) {
        console.error('Failed to delete image:', response);
        showError(`Impossible de supprimer l'image.`);
        return;
      }

      // Remove from local state
      const newImages = updatedGift.images.filter((img) => img.id !== image.id);
      setUpdatedGift({ ...updatedGift, images: newImages });
    } catch (error) {
      console.error('Error deleting image:', error);
      showError(`Erreur lors de la suppression de l'image.`);
    }
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
                    if (!plainData.includes('https')) {
                      console.log(`Did not received any https url from paste: ${plainData}`);
                      return;
                    }

                    console.log(`Creating new link from raw paste: ${plainData}`);

                    // Regex robuste
                    const regex = /\b((?:https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi;

                    // Extraction
                    const urls = plainData.match(regex);
                    if (!urls || urls.length === 0) {
                      console.log(`Did not received any https url from paste: ${plainData}`);
                      return;
                    }

                    // sanitize and create links
                    urls.map(url =>
                      url.startsWith("www.") ? "http://" + url : url
                    ).map(oneUrl => {
                      console.log(`Creating new link from url: ${oneUrl}`);
                      const hostname = new URL(oneUrl).host;
                      const newLink: GiftLink = {
                        id: '',
                        description: hostname ? hostname : `Lien ${updatedGift.links.length + 1}`,
                        url: oneUrl,
                        giftId: updatedGift.id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      }
                      return newLink;
                    }).forEach((link) => {
                      handleAddLink(link);
                    });
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
                  }).catch(error => console.error('Error while reading clipboard type:' + theType + '. Error: ' + error));

              }
            }
          }
        });
    } catch (error) {
      console.error('Error in magic paste', error);
    }
  };

  const handleRedirect = (url: string) => {
    navigate(`/redirect?url=${encodeURI(url)}&newTab=true`);
  }

  const images: GiftImage[] = updatedGift.images.length === 0 ? defaultImages : updatedGift.images;

  // Force carousel to re-render when images change by using images length as key
  const carouselKey = `carousel-${images.length}-${images.map(img => img.url).join('-').substring(0, 50)}`;

  const actions: BottomDialogAction[] = editable ? [
    {
      icon: <AutoFixHighIcon />,
      label: 'Coller',
      onClick: handleMagicPaste,
      disabled: isSaving
    },
    {
      icon: isSaving ? <CircularProgress size={24} /> : <CheckIcon />,
      label: 'OK',
      onClick: () => handleSaveGift(updatedGift, true),
      disabled: isSaving
    }
  ] : [];

  const contents = <Box sx={{ px: 2 }}>
    <Box component="form" sx={{ marginBottom: '20px' }}>
      <Carousel key={carouselKey} sx={{ width: '100%' }}>
        {images.map((oneImg, index) => {
          const isDefaultImage = !oneImg.id && defaultImages.some(defImg => defImg.url === oneImg.url);
          return (
            <FullSizeCenteredFlexBox key={`box-img-key-${index}`}>
              <Box sx={{ position: 'relative', width: '250px', height: '250px' }}>
                <Box
                  sx={{
                    background: `url('${oneImg.url}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                  key={`gift-img-key-${index}`}
                />
                {editable && !isDefaultImage && (
                  <IconButton
                    onClick={() => handleDeleteImage(oneImg)}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                      },
                    }}
                    size="small"
                  >
                    <HideImageIcon color="error" />
                  </IconButton>
                )}
              </Box>
            </FullSizeCenteredFlexBox>
          );
        })}
      </Carousel>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, mt: 2 }}>
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
        value={updatedGift.description ?? ''}
        onChange={handleInputChange}
        margin="normal"
        fullWidth
        disabled={!editable}
        placeholder="Nous en dire plus dans cette zone si besoin."
        multiline
        rows={2}
      />
    </Box>
  </Box>

  return (
    <BottomDialog
      open={open}
      handleClose={() => onClose(false)}
      title={editable ? 'Editer' : 'Détails'}
      actions={actions}
      contents={contents}
      disableBackdropClick={editable} />
  );
};

export default GiftForm;
