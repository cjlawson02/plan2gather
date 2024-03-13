import { render } from '@testing-library/react';

import { TRPCWrapper } from '@/utils/test-utils';

import GatheringView from './gathering-view';

describe('GatheringView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TRPCWrapper>
        <GatheringView />
      </TRPCWrapper>
    );
    expect(baseElement).toBeTruthy();
  });
});
