import React, { useCallback, useContext, useEffect, useState } from 'react';
import { TextField, Box, Link, ListItem, List, Tooltip, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Gift, GiftImage, GiftLink, LoginContext } from '@/LoginContext';
import { FullSizeCenteredFlexBox } from '../styled';
import GiftLinksMenu from './GiftLinksMenu';
import BottomDialog, { BottomDialogAction } from '../BottomDialog/BottomDialog';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/DeleteTwoTone';
import useNotifications from '@/store/notifications';

import { apiBaseUrl } from '@/config';

interface GiftFormProps {
  gift: Gift;
  editable: boolean;
  open: boolean;
  onClose: () => void;
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

  useEffect(() => {
    setUpdatedGift({...updatedGift, ...gift});
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
    if (!appContext.giftList) {
      console.error('When calling handleSaveGift, the gift list must be set in app context.');
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
      onClose();
    });
  };

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

  const handleAddImage = (imgUrl : string) => {
    const newImg: GiftImage = {
      url: imgUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      giftId: updatedGift.id
    };
    const myImages = updatedGift.images;
    myImages.push(newImg);
    setUpdatedGift({...updatedGift, images: myImages});
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedGift({ ...updatedGift, [event.target.name]: event.target.value });
  };

  const handlePasteImage = () => {
    try {      
      navigator.clipboard.read()
      .then(items => {
        for (let i = 0; i < items.length; i++) {
          const item: ClipboardItem = items[i];
          console.log(`clip board item: ${JSON.stringify(item.types)}`);         
          
          for(let j = 0; j< item.types.length; j++) {
            const theType = item.types[j];     
            console.log('Reading clipboard item type: ' + theType);       
              item.getType(theType)
              .then(blob => {                
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                  const data: string = e.target?.result as string;
                  console.log(`Data found for ${theType} : ${data}`);
                  if (theType.startsWith('image')) {
                    handleAddImage(data);
                  }
                  if(theType.startsWith('text')) {
                    const b64Data = data.split(';')[1].split(',')[1];                    
                    const plainData = atob(b64Data);
                    console.log(`Text data = ${plainData}`);

                    if (plainData.startsWith('https://')) {
                      const hostname = new URL(plainData).host;
                      const newLink: GiftLink = {
                        id: '',
                        description: hostname ? hostname : 'Lien',
                        url: plainData,
                        giftId: updatedGift.id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      }

                      handleAddLink(newLink);
                    }
              
                };
                if (theType.startsWith('text')) {
                  fileReader.readAsText(blob);
                }
                if (theType.startsWith('image')) {
                  fileReader.readAsDataURL(blob);
                }
              }}).catch(error => console.log('Error while reading clipboard type:' + theType + '. Error: ' + error))
          }
        }
      });
    } catch (error) {
      console.error('Error pasting image:', error);
    }
  };

  const images: GiftImage[] = updatedGift.images.length === 0 ? defaultImages : updatedGift.images;

  const actions: BottomDialogAction[] = [
    {
      icon: <AutoFixHighIcon/>,
      label: 'Coller',
      onClick: handlePasteImage
    },
    {
      icon: <CheckIcon/>,
      label: 'OK',
      onClick: () => handleSaveGift(updatedGift)
    }
  ];

  const contents = <Box component="form" sx={{marginBottom: '20px'}}>
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

<List>
  {updatedGift.links?.map((link) => (
          <Tooltip title={link.url} key={link.id}>
            <ListItem secondaryAction={
              <IconButton edge="end" aria-label="comments" onClick={(evt) => handleRemoveLink(link)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemIcon>
                <LaunchIcon />
              </ListItemIcon>
              <Link href={link.url} underline="hover" target="_blank" rel="noopener">{link.description}</Link>
            </ListItem>
          </Tooltip>
        ))}
</List>

  <GiftLinksMenu
      links={updatedGift.links}
      handleAddLink={handleAddLink}
      handleRemoveLink={handleRemoveLink}
      editable={editable}
    />
</Box>

  return (
    <BottomDialog open={open} 
                  handleClose={onClose} 
                  title={'Editer...'} 
                  actions={actions}
                  contents={contents} />    
  );
};

export default GiftForm;
