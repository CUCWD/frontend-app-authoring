import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, IconButton, useToggle } from '@openedx/paragon';
import {
  EditOutline as EditIcon,
  Settings as SettingsIcon,
} from '@openedx/paragon/icons';

import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import configureModalMessages from '../../generic/configure-modal/messages';
import { COURSE_BLOCK_NAMES } from '../../constants';
import { getCourseUnitData } from '../data/selectors';
import { updateQueryPendingStatus } from '../data/slice';
import messages from './messages';

// Helper function that converts estimated time from the "HH:MM:SS" format to "X hours and Y minutes" or "Z minutes".
const formatEstimatedTime = (estimatedTime) => {
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

/**
 * Added the estimated time features into the HeaderTitle. The estimated time will be displayed
 * next to the unit title and in the configure modal. The estimated time is retrieved from the 
 * course unit data and formatted using the formatEstimatedTime helper function. 
**/
const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
  handleConfigureSubmit,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [titleValue, setTitleValue] = useState(unitTitle);
  const currentItemData = useSelector(getCourseUnitData);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const { selectedPartitionIndex, selectedGroupsLabel } = currentItemData.userPartitionInfo ?? {};
  const estimatedTime = formatEstimatedTime(currentItemData.estimatedTime);

  const isXBlockComponent = [
    COURSE_BLOCK_NAMES.libraryContent.id,
    COURSE_BLOCK_NAMES.splitTest.id,
    COURSE_BLOCK_NAMES.component.id,
  ].includes(currentItemData.category);

  const readOnly = !!currentItemData.readOnly;

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(currentItemData.id, ...arg, closeConfigureModal);
  };

  const getVisibilityMessage = () => {
    let message;

    if (selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex) && selectedGroupsLabel) {
      message = intl.formatMessage(messages.definedVisibilityMessage, { selectedGroupsLabel });
    } else if (currentItemData.hasPartitionGroupComponents) {
      message = intl.formatMessage(messages.commonVisibilityMessage);
    }

    return message ? (<p className="header-title__visibility-message mb-0">{message}</p>) : null;
  };

  useEffect(() => {
    setTitleValue(unitTitle);
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  return (
    <>
      <div className="d-flex align-items-center lead" data-testid="unit-header-title">
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center">
            {isTitleEditFormOpen ? (
              <Form.Group className="m-0">
                <Form.Control
                  ref={(e) => e && e.focus()}
                  value={titleValue}
                  name="displayName"
                  onChange={(e) => setTitleValue(e.target.value)}
                  aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
                  onBlur={() => handleTitleEditSubmit(titleValue)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleEditSubmit(titleValue);
                    }
                  }}
                />
              </Form.Group>
            ) : unitTitle}
            <IconButton
              alt={intl.formatMessage(messages.altButtonEdit)}
              className="ml-1 flex-shrink-0"
              iconAs={EditIcon}
              onClick={handleTitleEdit}
              disabled={readOnly}
            />
            <IconButton
              alt={intl.formatMessage(messages.altButtonSettings)}
              className="flex-shrink-0"
              iconAs={SettingsIcon}
              onClick={openConfigureModal}
            />
          </div>
          {currentItemData.showEstimatedTime && estimatedTime && !isTitleEditFormOpen && (
            <span className="header-title__estimated-time text-primary mt-1">
              {intl.formatMessage(configureModalMessages.estimatedTimeTitle)}:
              {' '}
              <em>{estimatedTime}</em>
            </span>
          )}
        </div>
        <ConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={closeConfigureModal}
          onConfigureSubmit={onConfigureSubmit}
          currentItemData={currentItemData}
          isSelfPaced={false}
          isXBlockComponent={isXBlockComponent}
          userPartitionInfo={currentItemData?.userPartitionInfo || {}}
        />
      </div>
      {getVisibilityMessage()}
    </>
  );
};

export default HeaderTitle;

HeaderTitle.propTypes = {
  unitTitle: PropTypes.string.isRequired,
  isTitleEditFormOpen: PropTypes.bool.isRequired,
  handleTitleEdit: PropTypes.func.isRequired,
  handleTitleEditSubmit: PropTypes.func.isRequired,
  handleConfigureSubmit: PropTypes.func.isRequired,
};
