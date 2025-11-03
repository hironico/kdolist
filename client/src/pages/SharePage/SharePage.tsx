import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { LoginContext, Gift, GiftList, GiftImage, GiftLink } from '@/LoginContext';
import { apiBaseUrl } from '@/config';
import useNotifications from '@/store/notifications';

function SharePage() {
  const [sharedData, setSharedData] = useState<{
    title?: string;
    text?: string;
    url?: string;
    image?: File;
  } | null>(null);
  const [giftLists, setGiftLists] = useState<GiftList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [giftName, setGiftName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const appContext = useContext(LoginContext);
  const [, notificationsActions] = useNotifications();
  const navigate = useNavigate();

  // Extract shared data from form on component mount
  useEffect(() => {
    const extractSharedData = async () => {
      try {
        // Check if this is a POST request with form data
        const url = new URL(window.location.href);
        const params = new URLSearchParams(window.location.search);
        
        // For GET requests, check URL parameters
        const title = params.get('title') || undefined;
        const text = params.get('text') || undefined;
        const urlParam = params.get('url') || undefined;
        
        // For POST requests, we need to read the form data from the service worker cache
        // Since we can't directly access POST body in browser, we use a workaround
        // The service worker should convert POST to GET with query params
        
        setSharedData({
          title,
          text,
          url: urlParam,
        });
        
        // Set initial gift name
        if (title) {
          setGiftName(title);
        } else if (text) {
          setGiftName(text.substring(0, 50));
        } else if (urlParam) {
          try {
            const hostname = new URL(urlParam).hostname;
            setGiftName(`Gift from ${hostname}`);
          } catch {
            setGiftName('Shared Gift');
          }
        }
      } catch (error) {
        console.error('Error extracting shared data:', error);
        setError('Could not read shared content');
      }
      
      setIsLoading(false);
    };

    extractSharedData();
  }, []);

  // Fetch user's gift lists
  useEffect(() => {
    const fetchGiftLists = async () => {
      if (!appContext.loginInfo.jwt) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/giftlist/`, {
          headers: {
            Authorization: `Bearer ${appContext.loginInfo.jwt}`,
          },
        });

        if (response.ok) {
          const lists = await response.json();
          setGiftLists(lists);
          
          // Auto-select first list if only one exists
          if (lists.length === 1) {
            setSelectedListId(lists[0].id);
          }
        } else {
          setError('Could not load your gift lists');
        }
      } catch (error) {
        console.error('Error fetching gift lists:', error);
        setError('Network error while loading lists');
      }
    };

    fetchGiftLists();
  }, [appContext.loginInfo.jwt, navigate]);

  const handleSave = async () => {
    if (!selectedListId) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Please select a gift list',
      });
      return;
    }

    if (!giftName.trim()) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Please enter a gift name',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create the gift object
      const links: GiftLink[] = [];
      if (sharedData?.url) {
        const hostname = sharedData.url ? new URL(sharedData.url).hostname : 'Shared link';
        links.push({
          id: '',
          url: sharedData.url,
          description: hostname,
          giftId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const images: GiftImage[] = [];
      // If we have an image file, we'd need to convert it to base64
      // For now, we'll handle URL-based sharing

      const newGift: Partial<Gift> = {
        name: giftName,
        giftListId: selectedListId,
        links,
        images,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await fetch(`${apiBaseUrl}/gift/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${appContext.loginInfo.jwt}`,
        },
        body: JSON.stringify(newGift),
      });

      if (response.ok) {
        notificationsActions.push({
          options: { variant: 'success' },
          message: 'Gift added successfully!',
        });
        
        // Navigate to the list
        const selectedList = giftLists.find(l => l.id === selectedListId);
        if (selectedList) {
          appContext.setGiftList(selectedList);
          navigate('/listcontents');
        }
      } else {
        throw new Error('Failed to create gift');
      }
    } catch (error) {
      console.error('Error saving gift:', error);
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Could not save gift',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add Shared Content to Gift List
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {sharedData && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Shared Content:
              </Typography>
              {sharedData.title && (
                <Typography variant="body2">
                  <strong>Title:</strong> {sharedData.title}
                </Typography>
              )}
              {sharedData.text && (
                <Typography variant="body2">
                  <strong>Text:</strong> {sharedData.text}
                </Typography>
              )}
              {sharedData.url && (
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  <strong>URL:</strong> {sharedData.url}
                </Typography>
              )}
            </Box>
          )}

          <TextField
            label="Gift Name"
            value={giftName}
            onChange={(e) => setGiftName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Select Gift List</InputLabel>
            <Select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              label="Select Gift List"
            >
              {giftLists.map((list) => (
                <MenuItem key={list.id} value={list.id}>
                  {list.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isSaving || !selectedListId || !giftName.trim()}
              startIcon={isSaving ? <CircularProgress size={20} /> : <CheckIcon />}
              fullWidth
            >
              {isSaving ? 'Saving...' : 'Add to List'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/mylists')}
              disabled={isSaving}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SharePage;
