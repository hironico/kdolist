import React, { useContext, useState } from 'react';
import { List,  Typography, useTheme } from '@mui/material';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { GiftList, LoginContext } from '@/LoginContext';
import ActionSheet, { ActionSheetEntry } from '../ActionSheet/ActionSheet';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';
import SwipeableListItem, { SwipeableListItemAction } from '../SwipeableListItem/SwipeableListItem';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormatListBulleted } from '@mui/icons-material';

export type GiftListProps = {
  giftLists: GiftList[],
  editable: boolean,
  handleFetch: () => Promise<void>;
}

const GiftListsList: React.FC<GiftListProps> = ({giftLists, editable, handleFetch}) => {  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();

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

  const handleSelectAndConfirmDelete = (giftList: GiftList) => {
    appContext.setGiftList(giftList);
    setShowConfirmDialog(true);
  }

  const handleDeleteGiftList = async () => {
    if (!appContext.giftList) {
      console.warn('The handleDeleteGiftList should have not been called without a selected list in the context');
      return;
    }

    setShowConfirmDialog(false);

    const response = await fetch(`${apiBaseUrl}/giftlist/${appContext.giftList?.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appContext.loginInfo.jwt}`,
      },
    });

    if (!response.ok) {
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Impossible de SUPPRIMER cette liste pour le moment.'
      });
    } else {
      handleFetch();
      appContext.setGiftList(null);
    }
  }

  const actions:ActionSheetEntry[] = [
    {
      label: 'Oui, effacer la liste',
      color: 'error',
      onAction: () => handleDeleteGiftList()
    }
  ];

  const defaultAction: ActionSheetEntry = {
    label: 'Non, laisse tomber',
    color: 'primary',
    onAction: () => setShowConfirmDialog(false)
  }

  return (
    <>
      <List>
        {giftLists.map((item, index) => {
          const modifDate = new Date(item.updatedAt.toString());
          const secondaryText = <>
            <Typography variant='caption'>{`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}</Typography>
            <br/><Typography variant='caption'>{`Par: ${item.owner?.firstname}`}</Typography>
          </>

          const deleteAction: SwipeableListItemAction = {
            icon: <DeleteIcon />,
            color: 'error',
            onAction: () => handleSelectAndConfirmDelete(item)
          }

          const icon = <FormatListBulleted />

          return <SwipeableListItem 
                      onClickMain={() => handleNavigateList(item, editable)} 
                      action1={editable ? deleteAction : undefined} 
                      primaryText={item.name} 
                      secondaryText={secondaryText} 
                      icon={icon}
                      key={`index-${index}`} 
                    />
        })}
      </List>

      <ActionSheet open={showConfirmDialog} handleClose={() => setShowConfirmDialog(false)} entries={actions} defaultEntry={defaultAction} message="Attention c'est irreversible !"/>
    </>
  );
};

export default GiftListsList;