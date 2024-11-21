  import { Avatar, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import React, { useContext } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { Gift, LoginContext } from "@/LoginContext";

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
        const secondaryAction = !editable ? <></> : <IconButton edge="end" aria-label="editer" onClick={(e) => handleDelete(oneGift)}>
                                                      <DeleteIcon />
                                                    </IconButton>
        const modifDate = new Date(oneGift.updatedAt.toString());
        const secondaryText = <Typography variant="caption">{`Modif. ${modifDate.toLocaleDateString()} : ${modifDate.toLocaleTimeString()}`}</Typography>

        return <ListItem key={`gift-${index}`} disablePadding secondaryAction={secondaryAction}>
          <ListItemButton onClick={(evt) => handleShowGiftEditor(oneGift, editable)}>
              <ListItemAvatar>
                <Avatar>
                  <CardGiftcardIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={oneGift.name} secondary={secondaryText} />
              <Divider variant="inset"/>                        
          </ListItemButton>
          </ListItem>
      })}
    </List>
  )
}

export default GifsList;