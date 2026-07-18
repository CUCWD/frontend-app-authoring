import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { useBulkRerunAccess } from './data/bulkRerunAccess';
import BulkRerunsLayout from './BulkRerunsLayout';

jest.mock('./data/bulkRerunAccess', () => ({
  useBulkRerunAccess: jest.fn(),
}));

jest.mock('../header', () => {
  const Header = () => <div>Header</div>;
  return Header;
});
jest.mock('../plugin-slots/StudioHomeBulkRerunsSlot', () => ({
  StudioHomeBulkRerunsSlot: () => <div>Bulk reruns content</div>,
}));
jest.mock('@edx/frontend-component-footer', () => ({
  StudioFooterSlot: () => <div>Footer</div>,
}));

const mockedUseBulkRerunAccess = useBulkRerunAccess as jest.MockedFunction<typeof useBulkRerunAccess>;

const LocationDisplay = () => {
  const { pathname } = useLocation();
  return <div data-testid="location-display">{pathname}</div>;
};

describe('BulkRerunsLayout', () => {
  it('redirects non-superusers from bulk reruns to Studio Home', () => {
    mockedUseBulkRerunAccess.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/bulk-reruns']}>
        <Routes>
          <Route path="/bulk-reruns" element={<BulkRerunsLayout />} />
          <Route path="/home" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location-display')).toHaveTextContent('/home');
  });

  it('renders nothing while access is loading', () => {
    mockedUseBulkRerunAccess.mockReturnValue(null);

    const { container } = render(
      <MemoryRouter>
        <BulkRerunsLayout />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
