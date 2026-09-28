import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook, waitFor } from '@testing-library/react';

import { getBulkRerunAccessApiUrl, useBulkRerunAccess } from './bulkRerunAccess';

let axiosMock: MockAdapter;

describe('useBulkRerunAccess', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'superuser',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    axiosMock.restore();
  });

  it('enables bulk-rerun UI for a Django superuser', async () => {
    axiosMock.onGet(getBulkRerunAccessApiUrl()).reply(200, { is_superuser: true });

    const { result } = renderHook(() => useBulkRerunAccess());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('fails closed when the CMS access check fails', async () => {
    axiosMock.onGet(getBulkRerunAccessApiUrl()).networkError();

    const { result } = renderHook(() => useBulkRerunAccess());

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(result.current).toBe(false);
  });
});
