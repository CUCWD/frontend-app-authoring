import { StudioFooterSlot } from '@edx/frontend-component-footer';

import Header from '../header';
import { StudioHomeBulkRerunsSlot } from '../plugin-slots/StudioHomeBulkRerunsSlot';

const BulkRerunsLayout = () => (
  <div className="bg-light-400">
    <Header isHiddenMainMenu />
    <StudioHomeBulkRerunsSlot />
    <StudioFooterSlot />
  </div>
);

export default BulkRerunsLayout;
