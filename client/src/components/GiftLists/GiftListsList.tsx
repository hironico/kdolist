import React, { useContext } from 'react';
import { List, ListItemButton, ListItemText, IconButton, ListItem, ListItemAvatar, Avatar, Divider, Typography } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { ChevronRight } from '@mui/icons-material';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { GiftList, LoginContext } from '@/LoginContext';

export type GiftListProps = {
  giftLists: GiftList[],
  editable: boolean
}

const GiftListsList: React.FC<GiftListProps> = ({giftLists, editable}) => {
  const navigate = useNavigate();
  const appContext = useContext(LoginContext);

  /**
   * Navigates to the list contents editor. Sets the selecte dlist in the list editor context.
   * @param item the selected list to navitge to.
   */  
  const handleNavigateList = (item: GiftList, editable: boolean) => {    
    appContext.setGiftList(item);
    
    const opts: NavigateOptions = {
      state: { list: item, editable: editable },
      replace: true
    }

    navigate('/listcontents', opts);
  };

  /**
   * Selects the lists the user just taped onto. The list context editor
   * is updated so that addiotional commands appear. 
   * @param list the selected list.
   * 
   */
  const handleListSelection = (list: GiftList) => {
    appContext.setGiftList(list);
  }
 

  return (
    <>
      <List>
        {giftLists.map((item) => {
          const modifDate = new Date(item.updatedAt.toString());
          const secondaryText = <>
          <Typography variant='caption'>{`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}</Typography>
          <br/><Typography variant='caption'>{`Par: ${item.owner?.firstname}`}</Typography>
          </>
          return <ListItem key={item.id} sx={{ width: 'auto' }} disablePadding secondaryAction={
            <IconButton edge="end" aria-label="details" onClick={(_e) => handleNavigateList(item, editable)}>
              <ChevronRight />
            </IconButton>
          }>
            <ListItemButton selected={item.id === appContext.giftList?.id} onClick={(_e) => handleListSelection(item)} sx={{ width: '100%' }}>
            <ListItemAvatar>
                <Avatar>
                  <FormatListBulletedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`${item.name}`} secondary={secondaryText}/>
              <Divider variant="inset" component="div" /> 
              </ListItemButton>
          </ListItem>
        })}
      </List>
    </>
  );
};

export default GiftListsList;