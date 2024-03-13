import FacebookIcon from '@mui/icons-material/Facebook';
import IosShareIcon from '@mui/icons-material/IosShare';
import LinkIcon from '@mui/icons-material/Link';
import RedditIcon from '@mui/icons-material/Reddit';
import TwitterIcon from '@mui/icons-material/Twitter';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

export default function DropdownShareButton() {
  const popupState = usePopupState({ variant: 'popover', popupId: 'demo-popup-popper' });

  const handleShare = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    const ahref = window.location.href;
    const encodedAhref = encodeURIComponent(ahref);
    let link = '';
    switch (e.currentTarget.id) {
      case 'facebook':
        link = `https://www.facebook.com/sharer/sharer.php?u=${encodedAhref}`;
        open(link);
        break;
      case 'twitter':
        link = `https://twitter.com/intent/tweet?url=${encodedAhref}`;
        open(link);
        break;
      case 'reddit':
        link = `https://www.reddit.com/submit?url=${encodedAhref}`;
        open(link);
        break;
      case 'copy':
        void navigator.clipboard.writeText(ahref);
        break;
      default:
        break;
    }
    popupState.close();
  };
  const open = (socialLink: string) => {
    window.open(socialLink, '_blank');
  };

  return (
    <>
      <Tooltip title="Share" arrow disableInteractive>
        <IconButton {...bindTrigger(popupState)}>
          <IosShareIcon />
        </IconButton>
      </Tooltip>
      <Paper>
        <Menu {...bindMenu(popupState)}>
          <MenuItem id="facebook" onClick={handleShare}>
            <ListItemIcon>
              <FacebookIcon />
            </ListItemIcon>
            <ListItemText primary="Facebook" />
          </MenuItem>
          <MenuItem id="twitter" onClick={handleShare}>
            <ListItemIcon>
              <TwitterIcon />
            </ListItemIcon>
            <ListItemText primary="Twitter" />
          </MenuItem>
          <MenuItem id="reddit" onClick={handleShare}>
            <ListItemIcon>
              <RedditIcon />
            </ListItemIcon>
            <ListItemText primary="Reddit" />
          </MenuItem>
          <MenuItem id="copy" onClick={handleShare}>
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText primary="Copy Link" />
          </MenuItem>
        </Menu>
      </Paper>
    </>
  );
}
