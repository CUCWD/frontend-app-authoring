/* eslint-disable import/named */
import React from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Form,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { Formik } from 'formik';

import { VisibilityTypes } from '../../data/constants';
import { COURSE_BLOCK_NAMES } from '../../constants';
import messages from './messages';
import BasicTab from './BasicTab';
import VisibilityTab from './VisibilityTab';
import AdvancedTab from './AdvancedTab';
import UnitTab from './UnitTab';

const ConfigureModal = ({
  isOpen,
  onClose,
  onConfigureSubmit,
  currentItemData,
  enableProctoredExams = false,
  isXBlockComponent = false,
  isSelfPaced,
}) => {
  const intl = useIntl();
  const {
    displayName,
    start: sectionStartDate,
    visibilityState,
    due,
    isTimeLimited,
    defaultTimeLimitMinutes,
    hideAfterDue,
    showCorrectness,
    courseGraders,
    category,
    format,
    userPartitionInfo,
    ancestorHasStaffLock,
    isPrereq,
    prereqs,
    prereq,
    prereqMinScore,
    prereqMinCompletion,
    releasedToStudents,
    wasExamEverLinkedWithExternal,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    examReviewRules,
    supportsOnboarding,
    showReviewRules,
    onlineProctoringRules,
    discussionEnabled,
    estimatedTime,
    showEstimatedTime,
    courseShowEstimatedTime,
    overrideEstimatedTime,
    defaultComponentEstimatedTime,
  } = currentItemData || {};

  const getSelectedGroups = () => {
    if (userPartitionInfo?.selectedPartitionIndex >= 0) {
      return userPartitionInfo?.selectablePartitions[userPartitionInfo?.selectedPartitionIndex]
        ?.groups
        .filter(({ selected }) => selected)
        .map(({ id }) => `${id}`)
        || [];
    }
    return [];
  };

  const defaultPrereqScore = (val) => {
    if (val === null || val === undefined) {
      return 100;
    }
    return parseFloat(val);
  };

  const initialValues = {
    releaseDate: sectionStartDate,
    isVisibleToStaffOnly: visibilityState === VisibilityTypes.STAFF_ONLY,
    graderType: format == null ? 'notgraded' : format,
    dueDate: due == null ? '' : due,
    isTimeLimited,
    isProctoredExam,
    isOnboardingExam,
    isPracticeExam,
    examReviewRules,
    defaultTimeLimitMinutes,
    hideAfterDue: hideAfterDue === undefined ? false : hideAfterDue,
    showCorrectness,
    isPrereq,
    prereqUsageKey: prereq,
    prereqMinScore: defaultPrereqScore(prereqMinScore),
    prereqMinCompletion: defaultPrereqScore(prereqMinCompletion),
    // by default it is -1 i.e. accessible to all learners & staff
    selectedPartitionIndex: userPartitionInfo?.selectedPartitionIndex,
    selectedGroups: getSelectedGroups(),
    discussionEnabled,
    // Set the initial value of estimated time to the course unit's current estimated time if it exists,
    //  otherwise use the default component estimated time or '00:00:00' if neither is available. 
    estimatedTime: (estimatedTime && estimatedTime !== '00:00:00') ? estimatedTime  : (defaultComponentEstimatedTime || '00:00:00'),
    displayEstimatedTime: courseShowEstimatedTime ? true : (showEstimatedTime ?? false),
    overrideEstimatedTime: overrideEstimatedTime ?? false,
  };

  const validationSchema = Yup.object().shape({
    isTimeLimited: Yup.boolean(),
    isProctoredExam: Yup.boolean(),
    isPracticeExam: Yup.boolean(),
    isOnboardingExam: Yup.boolean(),
    examReviewRules: Yup.string(),
    defaultTimeLimitMinutes: Yup.number().nullable(true),
    hideAfterDueState: Yup.boolean(),
    showCorrectness: Yup.string().required(),
    isPrereq: Yup.boolean(),
    prereqUsageKey: Yup.string().nullable(true),
    prereqMinScore: Yup.number().min(
      0,
      intl.formatMessage(messages.minScoreError),
    ).max(
      100,
      intl.formatMessage(messages.minScoreError),
    ).nullable(true),
    prereqMinCompletion: Yup.number().min(
      0,
      intl.formatMessage(messages.minScoreError),
    ).max(
      100,
      intl.formatMessage(messages.minScoreError),
    ).nullable(true),
    selectedPartitionIndex: Yup.number().integer(),
    selectedGroups: Yup.array().of(Yup.string()),
    discussionEnabled: Yup.boolean(),
  });

  const isSubsection = category === COURSE_BLOCK_NAMES.sequential.id;

  const dialogTitle = isXBlockComponent
    ? intl.formatMessage(messages.componentTitle, { title: displayName })
    : intl.formatMessage(messages.title, { title: displayName });

  const handleSave = (data) => {
    let { releaseDate } = data;
    // to prevent passing an empty string to the backend
    releaseDate = releaseDate || null;
    const groupAccess = {};
    switch (category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        onConfigureSubmit(data.isVisibleToStaffOnly, releaseDate);
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        onConfigureSubmit(
          data.isVisibleToStaffOnly,
          releaseDate,
          data.graderType,
          data.dueDate,
          data.isTimeLimited,
          data.isProctoredExam,
          data.isOnboardingExam,
          data.isPracticeExam,
          data.examReviewRules,
          data.isTimeLimited ? data.defaultTimeLimitMinutes : 0,
          data.hideAfterDue,
          data.showCorrectness,
          data.isPrereq,
          data.prereqUsageKey,
          data.prereqMinScore,
          data.prereqMinCompletion,
          // Pass the estimated time parameters to the onConfigureSubmit function for sequential blocks.
          data.estimatedTime,
          data.displayEstimatedTime,
          data.overrideEstimatedTime,
        );
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
      case COURSE_BLOCK_NAMES.libraryContent.id:
      case COURSE_BLOCK_NAMES.splitTest.id:
      case COURSE_BLOCK_NAMES.component.id:
      // groupAccess should be {partitionId: [group1, group2]} or {} if selectedPartitionIndex === -1
        if (data.selectedPartitionIndex >= 0) {
          const partitionId = userPartitionInfo.selectablePartitions[data.selectedPartitionIndex].id;
          groupAccess[partitionId] = data.selectedGroups.map(g => parseInt(g, 10));
        }
        // Pass the estimated time parameters to the onConfigureSubmit function for vertical and component blocks.
        onConfigureSubmit(
          data.isVisibleToStaffOnly,
          groupAccess,
          data.discussionEnabled,
          data.estimatedTime,
          data.displayEstimatedTime,
          data.overrideEstimatedTime,
        );
        break;
      default:
        break;
    }
  };

  const renderModalBody = (values, setFieldValue) => {
    switch (category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        return (
          <Tabs>
            <Tab eventKey="basic" title={intl.formatMessage(messages.basicTabTitle)}>
              <BasicTab
                values={values}
                setFieldValue={setFieldValue}
                isSubsection={isSubsection}
                courseGraders={courseGraders === 'undefined' ? [] : courseGraders}
                isSelfPaced={isSelfPaced}
              />
            </Tab>
            <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
              <VisibilityTab
                values={values}
                setFieldValue={setFieldValue}
                category={category}
                isSubsection={isSubsection}
                showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
              />
            </Tab>
          </Tabs>
        );
      case COURSE_BLOCK_NAMES.sequential.id:
        return (
          <Tabs>
            <Tab eventKey="basic" title={intl.formatMessage(messages.basicTabTitle)}>
              <BasicTab
                values={values}
                setFieldValue={setFieldValue}
                isSubsection={isSubsection}
                courseGraders={courseGraders === 'undefined' ? [] : courseGraders}
                isSelfPaced={isSelfPaced}
              />
            </Tab>
            <Tab eventKey="visibility" title={intl.formatMessage(messages.visibilityTabTitle)}>
              <VisibilityTab
                values={values}
                setFieldValue={setFieldValue}
                category={category}
                isSubsection={isSubsection}
                showWarning={visibilityState === VisibilityTypes.STAFF_ONLY}
                isSelfPaced={isSelfPaced}
              />
            </Tab>
            <Tab eventKey="advanced" title={intl.formatMessage(messages.advancedTabTitle)}>
              <AdvancedTab
                values={values}
                setFieldValue={setFieldValue}
                prereqs={prereqs}
                releasedToStudents={releasedToStudents}
                wasExamEverLinkedWithExternal={wasExamEverLinkedWithExternal}
                enableProctoredExams={enableProctoredExams}
                supportsOnboarding={supportsOnboarding}
                showReviewRules={showReviewRules}
                wasProctoredExam={isProctoredExam}
                onlineProctoringRules={onlineProctoringRules}
              />
            </Tab>
          </Tabs>
        );
      case COURSE_BLOCK_NAMES.vertical.id:
      case COURSE_BLOCK_NAMES.libraryContent.id:
      case COURSE_BLOCK_NAMES.splitTest.id:
      case COURSE_BLOCK_NAMES.component.id:
        return (
          <UnitTab
            isXBlockComponent={isXBlockComponent}
            category={category}
            values={values}
            setFieldValue={setFieldValue}
            showWarning={visibilityState === VisibilityTypes.STAFF_ONLY && !ancestorHasStaffLock}
            userPartitionInfo={userPartitionInfo}
            // Pass the courseShowEstimatedTime value to the UnitTab to determine whether to show the estimated time settings in the configure modal for unit and component blocks.
            courseShowEstimatedTime={courseShowEstimatedTime ?? false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalDialog
      className="configure-modal"
      title={dialogTitle}
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <div data-testid="configure-modal">
        <ModalDialog.Header className="configure-modal__header">
          <ModalDialog.Title>
            {dialogTitle}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSave}
          validationSchema={validationSchema}
          validateOnBlur
          validateOnChange
        >
          {({
            values, handleSubmit, setFieldValue,
          }) => (
            <>
              <ModalDialog.Body className="configure-modal__body">
                <Form.Group size="sm" className="form-field">
                  {renderModalBody(values, setFieldValue)}
                </Form.Group>
              </ModalDialog.Body>
              <ModalDialog.Footer className="pt-1">
                <ActionRow>
                  <ModalDialog.CloseButton variant="tertiary">
                    {intl.formatMessage(messages.cancelButton)}
                  </ModalDialog.CloseButton>
                  <Button
                    data-testid="configure-save-button"
                    onClick={handleSubmit}
                  >
                    {intl.formatMessage(messages.saveButton)}
                  </Button>
                </ActionRow>
              </ModalDialog.Footer>
            </>
          )}
        </Formik>
      </div>
    </ModalDialog>
  );
};

ConfigureModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfigureSubmit: PropTypes.func.isRequired,
  enableProctoredExams: PropTypes.bool,
  currentItemData: PropTypes.shape({
    displayName: PropTypes.string,
    start: PropTypes.string,
    visibilityState: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    due: PropTypes.string,
    isTimeLimited: PropTypes.bool,
    defaultTimeLimitMinutes: PropTypes.number,
    hideAfterDue: PropTypes.bool,
    showCorrectness: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    courseGraders: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    format: PropTypes.string,
    userPartitionInfo: PropTypes.shape({
      selectablePartitions: PropTypes.arrayOf(PropTypes.shape({
        groups: PropTypes.arrayOf(PropTypes.shape({
          deleted: PropTypes.bool,
          id: PropTypes.number,
          name: PropTypes.string,
          selected: PropTypes.bool,
        })),
        id: PropTypes.number,
        name: PropTypes.string,
        scheme: PropTypes.string,
      })),
      selectedPartitionIndex: PropTypes.number,
      selectedGroupsLabel: PropTypes.string,
    }),
    ancestorHasStaffLock: PropTypes.bool,
    isPrereq: PropTypes.bool,
    prereqs: PropTypes.arrayOf({
      blockDisplayName: PropTypes.string,
      blockUsageKey: PropTypes.string,
    }),
    prereq: PropTypes.number,
    prereqMinScore: PropTypes.number,
    prereqMinCompletion: PropTypes.number,
    releasedToStudents: PropTypes.bool,
    wasExamEverLinkedWithExternal: PropTypes.bool,
    isProctoredExam: PropTypes.bool,
    isOnboardingExam: PropTypes.bool,
    isPracticeExam: PropTypes.bool,
    examReviewRules: PropTypes.string,
    supportsOnboarding: PropTypes.bool,
    showReviewRules: PropTypes.bool,
    onlineProctoringRules: PropTypes.string,
    discussionEnabled: PropTypes.bool,
    // Added the estimated time variables into the prop types
    estimatedTime: PropTypes.string,
    showEstimatedTime: PropTypes.bool,
    courseShowEstimatedTime: PropTypes.bool,
    overrideEstimatedTime: PropTypes.bool,
    defaultComponentEstimatedTime: PropTypes.string,
  }).isRequired,
  isXBlockComponent: PropTypes.bool,
  isSelfPaced: PropTypes.bool.isRequired,
};

export default ConfigureModal;
