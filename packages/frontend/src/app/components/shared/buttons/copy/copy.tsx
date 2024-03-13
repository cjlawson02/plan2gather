import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';

interface CopyButtonProps {
  text: string;
  ariaLabel?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const CopyButton = ({ text, ariaLabel, onClick }: CopyButtonProps) => {
  return (
    <Tooltip title="Copy to clipboard" disableInteractive arrow>
      <IconButton
        aria-label={ariaLabel}
        onClick={(e) => {
          void navigator.clipboard.writeText(text);
          if (onClick != null) {
            onClick(e);
          }
        }}
        edge="end"
      >
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  );
};
