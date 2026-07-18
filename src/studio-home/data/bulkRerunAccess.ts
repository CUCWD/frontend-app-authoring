import { useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getBulkRerunAccessApiUrl = () => `${getConfig().STUDIO_BASE_URL}/api/bulk-rerun/access/`;

async function getBulkRerunAccess(): Promise<boolean> {
  const { data } = await getAuthenticatedHttpClient().get(getBulkRerunAccessApiUrl());
  return data.is_superuser === true;
}

export function useBulkRerunAccess(): boolean | null {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let isCurrent = true;

    getBulkRerunAccess()
      .then((isSuperuser) => {
        if (isCurrent) {
          setHasAccess(isSuperuser);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHasAccess(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return hasAccess;
}
