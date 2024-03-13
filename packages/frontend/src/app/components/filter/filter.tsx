import { Stack } from '@mui/material';
import Chip from '@mui/material/Chip';
import { useCallback, useEffect, useState } from 'react';

import useGatheringViewData from '@/app/pages/gathering-view/gathering-view.store';

interface FilterProps {
  userLabels: string[];
}

export default function Filter({ userLabels }: FilterProps) {
  const initialState = userLabels.reduce<Record<string, boolean>>((acc, label) => {
    acc[label] = false;
    return acc;
  }, {});
  const [state, setState] = useState(initialState);

  const setCheckedUsers = useGatheringViewData((state) => state.setCheckedUsers);

  const updateCheckedUsers = useCallback(
    (checked: Record<string, boolean>) => {
      setCheckedUsers(
        Object.entries(checked)
          .filter(([, value]) => value)
          .map(([key]) => key)
      );
    },
    [setCheckedUsers]
  );

  const handleToggle = useCallback(
    (userLabel: string) => {
      setState((prev) => {
        const result = {
          ...prev,
          [userLabel]: !prev[userLabel],
        };

        updateCheckedUsers(result);

        return result;
      });
    },
    [updateCheckedUsers]
  );

  useEffect(() => {
    updateCheckedUsers(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateCheckedUsers]);

  return (
    <Stack
      direction="row"
      sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}
      spacing={1}
    >
      {userLabels.map((userLabel) => (
        <Chip
          key={userLabel}
          label={userLabel}
          onClick={() => {
            handleToggle(userLabel);
          }}
          color={state[userLabel] ? 'primary' : 'default'}
        />
      ))}
    </Stack>
  );
}
