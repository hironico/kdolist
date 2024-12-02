import { List, Typography } from "@mui/material";
import React, { useContext } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import { Gift, LoginContext } from "@/LoginContext";
import SwipeableListItem, { SwipeableListItemAction } from "../SwipeableListItem/SwipeableListItem";

type GiftsListProps = {
  handleDelete: (gift: Gift) => void;
  handleShowGiftEditor: (gift: Gift, editable:boolean) => void;
  editable: boolean;
}

const GifsList: React.FC<GiftsListProps> = ({ handleDelete, handleShowGiftEditor, editable }) => {
  const appContext = useContext(LoginContext);

  return (
    <List>
      {appContext.giftListContents?.map((oneGift, index) => {
        const modifDate = new Date(oneGift.updatedAt.toString());
        const secondaryText = <Typography variant="caption">
          {`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}
        </Typography>

        const deleteAction : SwipeableListItemAction = {
          icon: <DeleteIcon/>,
          color: 'error',
          onAction: () => handleDelete(oneGift)
        };

        return <SwipeableListItem key={`kdo-${index}`}
                    onClick={() => handleShowGiftEditor(oneGift, editable)}
                    primaryText={oneGift.name}
                    secondaryText={secondaryText}
                    action1={editable ? deleteAction : undefined} />        
      })
      }
    </List>
  )
}

export default GifsList;