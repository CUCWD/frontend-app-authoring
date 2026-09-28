import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';

import { useBulkRerunAccess } from '../../studio-home/data/bulkRerunAccess';

export const StudioHomeBulkRerunsSlot = () => {
  const hasAccess = useBulkRerunAccess();

  if (!hasAccess) {
    return null;
  }

  return <PluginSlot id="org.cucwd.frontend.authoring.studio_home_bulk_reruns.v1" />;
};
