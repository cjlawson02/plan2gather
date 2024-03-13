import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Popover from '@mui/material/Popover';
import { useState } from 'react';

import GridContainer from '@/app/components/shared/grid/grid-container';

import TimePopover from './time-popover/time-popover';

import type { CellData } from '@/app/pages/gathering-view/gathering-view.store';

interface TimeGridProps {
  data: CellData[][];
  columnLabels: string[];
  rowLabels: string[];
  timezone: string;
  mostParticipants: number;
}

const cellWidth = 100;

const isBestTime = (cell: CellData, mostParticipants: number) => {
  const numAvailable = cell.names.length;
  return { best: numAvailable > 1 && numAvailable === mostParticipants, numAvailable };
};

export default function TimeGrid({
  data,
  timezone,
  columnLabels,
  rowLabels,
  mostParticipants,
}: TimeGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    const selectedCellData = data[rowIndex][colIndex];
    setSelectedCell(selectedCellData);

    if (selectedCellData.names.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <GridContainer
      columnGap={1}
      columnLabels={columnLabels}
      rowLabels={rowLabels}
      cellWidth={cellWidth}
      cellProps={(rowIndex, colIndex) => {
        const cellData = data[rowIndex][colIndex];
        const { best, numAvailable } = isBestTime(cellData, mostParticipants);

        let props = {} as any;

        if (numAvailable > 0) {
          props = {
            ...props,
            sx: {
              backgroundColor: `rgba(0, ${100 + 155 * (cellData.names.length / cellData.totalParticipants)}, 0, 1)`,
            },
            cursor: 'pointer',
            component: 'button',
            ariaLabel: `${columnLabels[colIndex]}, ${rowLabels[rowIndex]}, ${numAvailable} out of ${cellData.totalParticipants} participants available${best ? ', best time' : ''}`,
            children: best && <CheckCircleOutlineIcon sx={{ color: 'black' }} />,
          };
        }

        return props;
      }}
      handleOnClicked={(e, rowIndex, colIndex) => {
        const { numAvailable } = isBestTime(data[rowIndex][colIndex], mostParticipants);
        if (numAvailable > 0)
          handleClick(e as React.MouseEvent<HTMLButtonElement>, rowIndex, colIndex);
      }}
    >
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {selectedCell != null && (
          <TimePopover
            weekday={selectedCell.weekday}
            dateRange={selectedCell.period}
            users={selectedCell.names}
            timezone={timezone}
            bestTime={isBestTime(selectedCell, mostParticipants).best}
          />
        )}
      </Popover>
    </GridContainer>
  );
}
