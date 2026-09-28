import { render, screen } from '@testing-library/react';

import { useBulkRerunAccess } from '../../studio-home/data/bulkRerunAccess';
import { StudioHomeBulkRerunsSlot } from '.';

jest.mock('../../studio-home/data/bulkRerunAccess', () => ({
  useBulkRerunAccess: jest.fn(),
}));

jest.mock('@openedx/frontend-plugin-framework/dist', () => ({
  PluginSlot: () => <div data-testid="bulk-rerun-slot" />,
}));

const mockedUseBulkRerunAccess = useBulkRerunAccess as jest.MockedFunction<typeof useBulkRerunAccess>;

describe('StudioHomeBulkRerunsSlot', () => {
  beforeEach(() => jest.resetAllMocks());

  it('renders the slot for Django superusers', () => {
    mockedUseBulkRerunAccess.mockReturnValue(true);

    render(<StudioHomeBulkRerunsSlot />);

    expect(screen.getByTestId('bulk-rerun-slot')).toBeInTheDocument();
  });

  it('does not render the slot for non-superusers', () => {
    mockedUseBulkRerunAccess.mockReturnValue(false);

    render(<StudioHomeBulkRerunsSlot />);

    expect(screen.queryByTestId('bulk-rerun-slot')).not.toBeInTheDocument();
  });

  it('does not render the slot while access is pending', () => {
    mockedUseBulkRerunAccess.mockReturnValue(null);

    render(<StudioHomeBulkRerunsSlot />);

    expect(screen.queryByTestId('bulk-rerun-slot')).not.toBeInTheDocument();
  });
});
