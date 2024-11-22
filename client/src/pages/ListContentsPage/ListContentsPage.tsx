import ActionSheet, { ActionSheetEntries } from "@/components/ActionSheet/ActionSheet";
import BottomDialog from "@/components/BottomDialog/BottomDialog";
import GiftForm from "@/components/Gifts/GiftForm";
import { GiftsFAB } from "@/components/Gifts/GiftsFAB";
import GifsList from "@/components/Gifts/GiftsList";
import Meta from "@/components/Meta";
import { FullSizeTopCenteredFlexBox } from "@/components/styled";
import { apiBaseUrl } from "@/config";
import { Gift, LoginContext } from "@/LoginContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import useNotifications from "@/store/notifications";
import {  Slide, } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const newEmptyGift = (): Gift => {
  return {
    id: "",
    name: "",
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const ListContentsPage: React.FC = () => {
  const [giftEditorOpen, setGiftEditorOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [gift, setGift] = useState<Gift>(newEmptyGift());
  const appContext = useContext(LoginContext);

  const [, notificationsActions] = useNotifications();

  const { state } = useLocation();

  const fetchListContents = () => {
    try {
      if (!appContext.giftList) {
        console.log('Cannot fetch list contents since no list is defined in the context.')
        return;
      }

      console.log('Fetching list contents: ', appContext.giftList.id);

      fetch(`${apiBaseUrl}/giftlist/contents/${appContext.giftList.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${appContext.loginInfo.jwt}`
        }
      }).then(response => {
        if (response.ok) {
          response.json().then(data => appContext.setGiftListContents(data));
        } else {
          console.error('Failed to fetch details', JSON.stringify(response, null, 2));
        }
      })
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  useEffect(() => {
    fetchListContents();
    setGift(newEmptyGift());
  }, []);

  const handleAddGift = () => {
    setGift(newEmptyGift());
    setGiftEditorOpen(true);
  }

  const handleDeleteGift = () => {
    deleteGift();
    setConfirmDeleteOpen(false);
  }

  const handleConfirmDeleteGift = (gift: Gift) => {
    setGift(gift);
    setConfirmDeleteOpen(true);
  }

  const deleteGift = () => {
    fetch(`${apiBaseUrl}/gift/${gift.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appContext.loginInfo.jwt}`
      }
    })
      .then(response => {
        if (!response.ok) {
          console.error(JSON.stringify(response));
          notificationsActions.push({
            options: {
              variant: 'error',
            },
            message: `Impossible de supprimer l'entrée dans la liste.`
          });
        } else {
          fetchListContents();
          setGift(newEmptyGift);
        }
      });
  }

  const handleShowGiftEditor = (gift: Gift) => {
    setGift(gift);
    setGiftEditorOpen(true);
  }

  const handleSaveGift = (gift: Gift) => {
    if (!appContext.giftList) {
      console.error('When calling handleSaveGift, the gift list must be set in app context.');
      return;
    }

    gift.giftListId = appContext.giftList?.id;

    // TODO aad images to gift

    setGiftEditorOpen(false);

    fetch(`${apiBaseUrl}/gift/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appContext.loginInfo.jwt}`
      },
      body: JSON.stringify(gift)
    })
      .then(response => {
        if (!response.ok) {
          console.error(JSON.stringify(response));
          notificationsActions.push({
            options: {
              variant: 'error',
            },
            message: `Impossible de sauver la liste pour le moment.`
          });
        } else {
          fetchListContents();
          setGift(newEmptyGift);
        }
      });
  }

  const actions: ActionSheetEntries[] = [
    {
      label: "Oui, effacer ce cadeau de la liste",
      color: "secondary",
      onAction: handleDeleteGift
    }
  ]

  const defaultAction: ActionSheetEntries = {
    label: 'Non, laisse tomber',
    color: 'primary',
    onAction: () => setConfirmDeleteOpen(false)
  }

  return (
    <ProtectedRoute>
      <Meta title={appContext.giftList?.name} />
      <Slide direction='left' in={true} timeout={500}>
        <FullSizeTopCenteredFlexBox>
          <GifsList handleDelete={handleConfirmDeleteGift} handleShowGiftEditor={handleShowGiftEditor} editable={state.editable}/>
          {state.editable ? <GiftsFAB handleAdd={handleAddGift}/> : <></>}
        </FullSizeTopCenteredFlexBox>
      </Slide>

      <BottomDialog open={giftEditorOpen} handleClose={() => setGiftEditorOpen(false)} title="Editer un cadeau" contents={
        <GiftForm gift={gift} onSave={handleSaveGift} editable={state.editable} />
      }/>

      <ActionSheet open={confirmDeleteOpen} handleClose={() => setConfirmDeleteOpen(false)} entries={actions} defaultEntry={defaultAction}/>
     
    </ProtectedRoute>
  );
}

export default ListContentsPage;