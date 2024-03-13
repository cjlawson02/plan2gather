import Box from '@mui/material/Box';

import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/system';

interface GridCellProps {
  rowIndex: number;
  cellWidth: number;
  cursor: 'cell' | 'default' | 'pointer';
  component?: React.ElementType;
  sx?: SxProps<Theme>;
  handleOnClicked?: (e: React.MouseEvent) => void;
  handleMouseDown?: (e: React.MouseEvent) => void;
  handleMouseEnter?: (e: React.MouseEvent) => void;
  handleMouseUp?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

const GridCell = ({
  rowIndex,
  cellWidth,
  component,
  cursor,
  sx,
  handleOnClicked,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  children,
}: GridCellProps) => (
  <Box
    sx={{
      width: cellWidth,
      height: 30,
      borderTop: rowIndex > 0 ? '1px dotted black' : 0,
      borderBottom: 0,
      backgroundColor: '#cccccc',
      borderLeft: '1px solid black',
      borderRight: '1px solid black',
      cursor,
      ...sx,
    }}
    component={component}
    onClick={(e) => {
      e.preventDefault();
      if (handleOnClicked != null) handleOnClicked(e);
    }}
    onMouseDown={handleMouseDown}
    onMouseEnter={handleMouseEnter}
    onMouseUp={handleMouseUp}
  >
    {children}
  </Box>
);

export default GridCell;
