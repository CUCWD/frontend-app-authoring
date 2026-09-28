import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { Navigate } from 'react-router-dom';

import Header from '../header';
import { StudioHomeBulkRerunsSlot } from '../plugin-slots/StudioHomeBulkRerunsSlot';
import { useBulkRerunAccess } from './data/bulkRerunAccess';

const BulkRerunsLayout = () => {
  const hasBulkRerunAccess = useBulkRerunAccess();

  // Keep direct navigation from bypassing the superuser-only tab and plugin slot.
  if (hasBulkRerunAccess === false) {
    return <Navigate to="/home" replace />;
  }

  // Wait for the CMS access check before rendering or redirecting a superuser.
  if (hasBulkRerunAccess === null) {
    return null;
  }

  return (
    <div className="bg-light-400">
      <Header isHiddenMainMenu />
      <StudioHomeBulkRerunsSlot />
      <StudioFooterSlot />
    </div>
  );
};

export default BulkRerunsLayout;
