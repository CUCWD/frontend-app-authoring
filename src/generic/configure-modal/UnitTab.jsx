import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Form } from '@openedx/paragon';
import {
  FormattedMessage, injectIntl, useIntl,
} from '@edx/frontend-platform/i18n';
import { Field } from 'formik';
import classNames from 'classnames';

import { COURSE_BLOCK_NAMES } from '../../constants';
import messages from './messages';

// Added DiscussionEditComponent. This component may be leftover from when I moved from the master branch to the teak-design-tokens branch.
export const DiscussionEditComponent = ({
  discussionEnabled,
  handleDiscussionChange,
}) => (
  <>
    <Form.Checkbox checked={discussionEnabled} onChange={handleDiscussionChange}>
      <FormattedMessage {...messages.discussionEnabledCheckbox} />
    </Form.Checkbox>
    <p className="x-small font-weight-bold"><FormattedMessage {...messages.discussionEnabledDescription} /></p>
  </>
);

export const AccessEditComponent = ({
  selectedPartitionIndex,
  setFieldValue,
  userPartitionInfo,
  selectedGroups,
}) => {
  const intl = useIntl();

  const checkIsDeletedGroup = (group) => {
    const isGroupSelected = selectedGroups.includes(group.id.toString());

    return group.deleted && isGroupSelected;
  };

  // Added AccessEditComponent to control the user partition and group access settings for course units and components. 
  // This component includes a dropdown to select the user partition and checkboxes to select the groups within the selected partition. 
  // The component also handles the case where a selected group has been deleted, displaying an error message next to the deleted group.
  const handleSelect = (e) => {
    setFieldValue('selectedPartitionIndex', parseInt(e.target.value, 10));
    setFieldValue('selectedGroups', selectedGroups);
  };

  return (
    <>
      <Form.Label className="font-weight-bold">
        <FormattedMessage {...messages.restrictAccessTo} />
      </Form.Label>
      <Form.Control
        as="select"
        name="groupSelect"
        value={selectedPartitionIndex}
        onChange={handleSelect}
        data-testid="group-type-select"
      >
        <option value="-1" key="-1">
          {userPartitionInfo.selectedPartitionIndex === -1
            ? intl.formatMessage(messages.unitSelectGroupType)
            : intl.formatMessage(messages.unitAllLearnersAndStaff)}
        </option>
        {userPartitionInfo.selectablePartitions.map((partition, index) => (
          <option
            key={partition.id}
            value={index}
          >
            {partition.name}
          </option>
        ))}
      </Form.Control>

      {selectedPartitionIndex >= 0 && userPartitionInfo.selectablePartitions.length && (
        <Form.Group controlId="select-groups-checkboxes">
          <Form.Label><FormattedMessage {...messages.unitSelectGroup} /></Form.Label>
          <div
            role="group"
            className="d-flex flex-column"
            data-testid="group-checkboxes"
            aria-labelledby="select-groups-checkboxes"
          >
            {userPartitionInfo.selectablePartitions[selectedPartitionIndex].groups.map((group) => (
              <Form.Group
                key={group.id}
                className="pgn__form-checkbox"
              >
                <Field
                  as={Form.Control}
                  className="flex-grow-0 mr-1"
                  controlClassName="pgn__form-checkbox-input mr-1"
                  type="checkbox"
                  value={`${group.id}`}
                  name="selectedGroups"
                />
                <div>
                  <Form.Label
                    className={classNames({ 'text-danger': checkIsDeletedGroup(group) })}
                    isInline
                  >
                    {group.name}
                  </Form.Label>
                  {group.deleted && (
                    <Form.Control.Feedback type="invalid" hasIcon={false}>
                      <FormattedMessage {...messages.unitSelectDeletedGroupErrorMessage} />
                    </Form.Control.Feedback>
                  )}
                </div>
              </Form.Group>
            ))}
          </div>
        </Form.Group>
      )}
    </>
  );
};

/** 
 * Added EstimatedTimeEditComponent to control the estimated time settings for course units and components in the configure modal. 
 * This component includes an input field to set the estimated time, a checkbox to toggle the display of the estimated time to learners, 
 * and a checkbox to override the estimated time for the unit or component. 
 * The component also handles the logic to enable or disable the input field based on whether the override checkbox is checked, 
 * and to show appropriate helper text and descriptions for each setting.
 **/
export const EstimatedTimeEditComponent = ({
  estimatedTime,
  displayEstimatedTime,
  overrideEstimatedTime,
  courseShowEstimatedTime,
  handleEstimatedTimeChange,
  handleDisplayEstimatedTimeChange,
  handleOverrideEstimatedTimeChange,
}) => {
  const formattedEstimatedTime = estimatedTime || '00:00:00';
  const [localTime, setLocalTime] = useState(formattedEstimatedTime);

  useEffect(() => {
    setLocalTime(formattedEstimatedTime);
  }, [formattedEstimatedTime]);

  const handleBlur = () => {
    if (localTime !== formattedEstimatedTime) {
      handleEstimatedTimeChange({ target: { value: localTime } });
    }
  };

  return (
    <>
      <Form.Group>
        <Form.Label className="font-weight-bold">
          <FormattedMessage {...messages.estimatedTimeDescription} />
        </Form.Label>
        <Form.Control
          type="text"
          value={localTime}
          placeholder="00:00:00"
          onChange={(e) => setLocalTime(e.target.value)}
          onBlur={handleBlur}
          disabled={!overrideEstimatedTime}
          style={{
            backgroundColor: overrideEstimatedTime ? '#fff' : '#e9ecef',
            cursor: overrideEstimatedTime ? 'text' : 'not-allowed',
          }}
        />
        <Form.Text muted>
          <FormattedMessage
            {...messages.estimatedTimeHelp}
            values={{ defaultTime: '00:00:00' }}
          />
        </Form.Text>
      </Form.Group>

      <Form.Checkbox
        checked={displayEstimatedTime}
        onChange={courseShowEstimatedTime ? undefined : handleDisplayEstimatedTimeChange}
        className="mt-3"
        disabled={courseShowEstimatedTime}
      >
        <FormattedMessage {...messages.displayEstimatedTimeCheckbox} />
      </Form.Checkbox>
      <p className="x-small font-weight-bold">
        <FormattedMessage
          {...(courseShowEstimatedTime
            ? messages.courseDisplayEstimatedTimeDescription
            : messages.displayEstimatedTimeDescription)}
        />
      </p>

      <Form.Checkbox
        checked={overrideEstimatedTime}
        onChange={handleOverrideEstimatedTimeChange}
        className="mt-2"
      >
        <FormattedMessage {...messages.overrideEstimatedTimeCheckbox} />
      </Form.Checkbox>
      <p className="x-small font-weight-bold">
        <FormattedMessage {...messages.overrideEstimatedTimeDescription} />
      </p>
    </>
  );
};

const UnitTab = ({
  isXBlockComponent,
  category,
  values,
  setFieldValue,
  showWarning,
  userPartitionInfo,
  courseShowEstimatedTime,
}) => {
  const {
    isVisibleToStaffOnly,
    selectedPartitionIndex,
    selectedGroups,
    discussionEnabled,
    estimatedTime,
    displayEstimatedTime,
    overrideEstimatedTime,
  } = values;

  const handleVisibilityChange = (e) => {
    setFieldValue('isVisibleToStaffOnly', e.target.checked);
  };

  const handleDiscussionChange = (e) => {
    setFieldValue('discussionEnabled', e.target.checked);
  };

  const handleEstimatedTimeChange = (e) => {
    setFieldValue('estimatedTime', e.target.value);
    if (!overrideEstimatedTime) {
      setFieldValue('overrideEstimatedTime', true);
    }
  };

  const handleDisplayEstimatedTimeChange = (e) => {
    const isChecked = e.target.checked;
    setFieldValue('displayEstimatedTime', isChecked);
    if (!isChecked) {
      setFieldValue('displayEstimatedTime', false);
    }
  };

  const handleOverrideEstimatedTimeChange = (e) => {
    const isChecked = e.target.checked;
    setFieldValue('overrideEstimatedTime', isChecked);

    if (isChecked && (!estimatedTime || estimatedTime === '00:00:00')) {
      setFieldValue('estimatedTime', '00:00:00');
    }
  };

  const getAccessBlockTitle = () => {
    switch (category) {
      case COURSE_BLOCK_NAMES.libraryContent.id:
        return messages.libraryContentAccess;
      case COURSE_BLOCK_NAMES.splitTest.id:
        return messages.splitTestAccess;
      default:
        return messages.unitAccess;
    }
  };

  return (
    <>
      {!isXBlockComponent && (
        <>
          <h4 className="mt-3"><FormattedMessage {...messages.unitVisibility} /></h4>
          <hr />
          <Form.Checkbox checked={isVisibleToStaffOnly} onChange={handleVisibilityChange} data-testid="unit-visibility-checkbox">
            <FormattedMessage {...messages.hideFromLearners} />
          </Form.Checkbox>
          {showWarning && (
            <Alert className="mt-2" variant="warning">
              <FormattedMessage {...messages.unitVisibilityWarning} />
            </Alert>
          )}
        </>
      )}
      {userPartitionInfo.selectablePartitions.length > 0 && (
        <Form.Group controlId="groupSelect">
          <h4 className="mt-3">
            <FormattedMessage {...getAccessBlockTitle()} />
          </h4>
          <hr />
          <AccessEditComponent
            selectedPartitionIndex={selectedPartitionIndex}
            setFieldValue={setFieldValue}
            userPartitionInfo={userPartitionInfo}
            selectedGroups={selectedGroups}
          />
        </Form.Group>
      )}
      {!isXBlockComponent && (
        <>
          <h4 className="mt-4"><FormattedMessage {...messages.discussionEnabledSectionTitle} /></h4>
          <hr />
          <DiscussionEditComponent
            discussionEnabled={discussionEnabled}
            handleDiscussionChange={handleDiscussionChange}
          />
        </>
      )}
      {!isXBlockComponent && (
        <>
          <h4 className="mt-4"><FormattedMessage {...messages.estimatedTimeTitle} /></h4>
          <hr />
          <EstimatedTimeEditComponent
            estimatedTime={estimatedTime}
            displayEstimatedTime={displayEstimatedTime}
            overrideEstimatedTime={overrideEstimatedTime}
            courseShowEstimatedTime={courseShowEstimatedTime}
            handleEstimatedTimeChange={handleEstimatedTimeChange}
            handleDisplayEstimatedTimeChange={handleDisplayEstimatedTimeChange}
            handleOverrideEstimatedTimeChange={handleOverrideEstimatedTimeChange}
          />
        </>
      )}
    </>
  );
};

// Added the new estimated time related props into the UnitTab prop types to control the estimated time settings for course units and components in the configure modal.
UnitTab.defaultProps = {
  isXBlockComponent: false,
  category: undefined,
  courseShowEstimatedTime: false,
};

DiscussionEditComponent.propTypes = {
  discussionEnabled: PropTypes.bool.isRequired,
  handleDiscussionChange: PropTypes.func.isRequired,
};

AccessEditComponent.propTypes = {
  selectedPartitionIndex: PropTypes.number.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  userPartitionInfo: PropTypes.shape({
    selectablePartitions: PropTypes.arrayOf(PropTypes.shape({
      groups: PropTypes.arrayOf(PropTypes.shape({
        deleted: PropTypes.bool.isRequired,
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        selected: PropTypes.bool.isRequired,
      }).isRequired).isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      scheme: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    selectedPartitionIndex: PropTypes.number.isRequired,
  }).isRequired,
  selectedGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
};

EstimatedTimeEditComponent.propTypes = {
  estimatedTime: PropTypes.string,
  displayEstimatedTime: PropTypes.bool.isRequired,
  overrideEstimatedTime: PropTypes.bool.isRequired,
  courseShowEstimatedTime: PropTypes.bool,
  handleEstimatedTimeChange: PropTypes.func.isRequired,
  handleDisplayEstimatedTimeChange: PropTypes.func.isRequired,
  handleOverrideEstimatedTimeChange: PropTypes.func.isRequired,
};

EstimatedTimeEditComponent.defaultProps = {
  estimatedTime: '00:00:00',
  courseShowEstimatedTime: false,
};

UnitTab.propTypes = {
  isXBlockComponent: PropTypes.bool,
  category: PropTypes.string,
  values: PropTypes.shape({
    isVisibleToStaffOnly: PropTypes.bool.isRequired,
    discussionEnabled: PropTypes.bool,
    estimatedTime: PropTypes.string,
    displayEstimatedTime: PropTypes.bool,
    overrideEstimatedTime: PropTypes.bool,
    selectedPartitionIndex: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    selectedGroups: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.array,
    ]),
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  showWarning: PropTypes.bool.isRequired,
  courseShowEstimatedTime: PropTypes.bool,
  userPartitionInfo: PropTypes.shape({
    selectablePartitions: PropTypes.arrayOf(PropTypes.shape({
      groups: PropTypes.arrayOf(PropTypes.shape({
        deleted: PropTypes.bool.isRequired,
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        selected: PropTypes.bool.isRequired,
      }).isRequired).isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      scheme: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    selectedGroupsLabel: PropTypes.string,
    selectedPartitionIndex: PropTypes.number.isRequired,
  }).isRequired,
};

export default injectIntl(UnitTab);
