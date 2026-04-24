import { useDispatch, useSelector } from 'react-redux';
import { Icon, Stack, useToggle } from '@openedx/paragon';
import { AccessTime, InfoOutline as InfoOutlineIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import useCourseUnitData from './hooks';
import { useIframe } from '../../generic/hooks/context/hooks';
import { editCourseUnitVisibilityAndData } from '../data/thunk';
import { SidebarBody, SidebarFooter, SidebarHeader } from './components';
import { PUBLISH_TYPES, messageTypes } from '../constants';
import { getCourseUnitData } from '../data/selectors';
import messages from './messages';
import ModalNotification from '../../generic/modal-notification';
import configureModalMessages from '../../generic/configure-modal/messages';

// Helper function that converts estimated time from the "HH:MM:SS" format to "X hours and Y minutes" or "Z minutes".
const formatEstimatedTime = (estimatedTime?: string) => {
  if (!estimatedTime || estimatedTime === '00:00:00') {
    return null;
  }
  const [hours = '0', minutes = '0', seconds = '0'] = estimatedTime.split(':');
  const totalMinutes = Math.ceil(((
    (Number.parseInt(hours, 10) || 0) * 3600
  ) + (
    (Number.parseInt(minutes, 10) || 0) * 60
  ) + (
    Number.parseInt(seconds, 10) || 0
  )) / 60);
  if (totalMinutes <= 0) {
    return null;
  }
  if (totalMinutes >= 60) {
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return `${totalHours} hour${totalHours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
  return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
};

interface PublishControlsProps {
  blockId?: string,
}

const PublishControls = ({ blockId }: PublishControlsProps) => {
  const unitData = useSelector(getCourseUnitData);
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(unitData);
  // Format the estimated time for display in the sidebar
  const estimatedTime = formatEstimatedTime(unitData.estimatedTime);
  const intl = useIntl();
  const { sendMessageToIframe } = useIframe();

  const [isDiscardModalOpen, openDiscardModal, closeDiscardModal] = useToggle(false);
  const [isVisibleModalOpen, openVisibleModal, closeVisibleModal] = useToggle(false);

  const dispatch = useDispatch();

  const handleCourseUnitVisibility = () => {
    closeVisibleModal();
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, null));
  };

  const handleCourseUnitDiscardChanges = () => {
    closeDiscardModal();
    dispatch(editCourseUnitVisibilityAndData(
      blockId,
      PUBLISH_TYPES.discardChanges,
      null,
      null,
      null,
      () => sendMessageToIframe(messageTypes.refreshXBlock, null),
    ));
  };

  const handleCourseUnitPublish = () => {
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic));
  };

  return (
    <>
      <SidebarHeader
        title={title}
        visibilityState={visibilityState}
      />
      <SidebarBody
        releaseLabel={releaseLabel}
        visibleToStaffOnly={visibleToStaffOnly}
      />
      {/* Format the estimated time for display in the sidebar */}
      {unitData.showEstimatedTime && estimatedTime && (
        <Stack gap={1} className="px-3 pb-3 course-unit-sidebar-estimated-time text-primary-700">
          <Stack direction="horizontal" gap={1}>
            <Icon src={AccessTime} />
            <span className="course-unit-sidebar-estimated-time__text">
              {intl.formatMessage(configureModalMessages.estimatedTimeTitle)}:
              {' '}
              <em>{estimatedTime}</em>
            </span>
          </Stack>
        </Stack>
      )}
      <SidebarFooter
        locationId={locationId}
        openDiscardModal={openDiscardModal}
        openVisibleModal={openVisibleModal}
        handlePublishing={handleCourseUnitPublish}
        visibleToStaffOnly={visibleToStaffOnly}
      />
      <ModalNotification
        title={intl.formatMessage(messages.modalDiscardUnitChangesTitle)}
        isOpen={isDiscardModalOpen}
        actionButtonText={intl.formatMessage(messages.modalDiscardUnitChangesActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalDiscardUnitChangesCancelButtonText)}
        handleAction={handleCourseUnitDiscardChanges}
        handleCancel={closeDiscardModal}
        message={intl.formatMessage(messages.modalDiscardUnitChangesDescription)}
        icon={InfoOutlineIcon}
      />
      <ModalNotification
        title={intl.formatMessage(messages.modalMakeVisibilityTitle)}
        isOpen={isVisibleModalOpen}
        actionButtonText={intl.formatMessage(messages.modalMakeVisibilityActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalMakeVisibilityCancelButtonText)}
        handleAction={handleCourseUnitVisibility}
        handleCancel={closeVisibleModal}
        message={intl.formatMessage(messages.modalMakeVisibilityDescription)}
        icon={InfoOutlineIcon}
      />
    </>
  );
};

export default PublishControls;
