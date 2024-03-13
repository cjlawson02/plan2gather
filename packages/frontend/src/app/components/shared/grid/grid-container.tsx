import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';

import GridCell from './grid-cell';

import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/system';

type GridCellInputProps = (
  rowIndex: number,
  colIndex: number
) => {
  sx?: SxProps<Theme>;
  cursor?: 'cell' | 'pointer';
  component?: React.ElementType;
  ariaLabel?: string;
  children?: React.ReactNode;
};

interface GridContainerProps {
  columnGap?: number;
  columnLabels: string[];
  rowLabels: string[];
  cellWidth: number;
  cellProps: GridCellInputProps;
  handleOnClicked?: (e: React.MouseEvent, rowIndex: number, colIndex: number) => void;
  handleMouseDown?: (e: React.MouseEvent, rowIndex: number, colIndex: number) => void;
  handleMouseEnter?: (rowIndex: number, colIndex: number) => void;
  handleMouseUp?: (e: React.MouseEvent, rowIndex: number, colIndex: number) => void;
  children?: React.ReactNode;
}

const GridContainer = ({
  columnGap,
  columnLabels,
  rowLabels,
  cellWidth,
  cellProps,
  handleOnClicked,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  children,
}: GridContainerProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnLabels.length + 1}, ${cellWidth}px)`,
        columnGap,
      }}
    >
      {/* Empty cell for the top-left corner */}
      <Box />

      {/* Render column labels */}
      {columnLabels.map((label) => (
        <Typography key={label} align="center" variant="button">
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Typography>
      ))}

      {/* Render data rows with row labels */}
      {rowLabels.map((rowLabel, rowIndex) => (
        <Fragment key={rowLabels[rowIndex]}>
          {/* Render row label */}
          <Box
            sx={{
              pr: 1,
              marginTop: '-10px',
            }}
          >
            {rowLabel.match(/:(00|30)\b/) != null && (
              <Typography align="right" variant="body2">
                {rowLabel}
              </Typography>
            )}
          </Box>
          {/* Render data cells, excluding row label for last cell */}
          {rowLabels.length - 1 !== rowIndex &&
            columnLabels.map((_, colIndex) => {
              const { ariaLabel, sx, component, cursor, children } = cellProps(rowIndex, colIndex);

              return (
                <GridCell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  cellWidth={cellWidth}
                  cursor={cursor ?? 'default'}
                  component={component}
                  sx={sx}
                  aria-label={ariaLabel}
                  handleOnClicked={(e) => {
                    if (handleOnClicked != null) handleOnClicked(e, rowIndex, colIndex);
                  }}
                  handleMouseDown={(e) => {
                    if (handleMouseDown != null) handleMouseDown(e, rowIndex, colIndex);
                  }}
                  handleMouseEnter={() => {
                    if (handleMouseEnter != null) handleMouseEnter(rowIndex, colIndex);
                  }}
                  handleMouseUp={(e) => {
                    if (handleMouseUp != null) handleMouseUp(e, rowIndex, colIndex);
                  }}
                >
                  {children}
                </GridCell>
              );
            })}
        </Fragment>
      ))}
      {children}
    </Box>
  );
};

export default GridContainer;
