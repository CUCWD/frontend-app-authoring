import WholeCourseTranslation from '@edx/course-app-translation-plugin';
import { AutoGatingButton } from '@CUCWD/frontend-plugin-auto-prereq-gating';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

// Load environment variables from .env file
const config = {
  ...process.env,
  pluginSlots: {
    additional_course_plugin: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'whole-course-translation-plugin',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: WholeCourseTranslation,
          },
        },
      ],
    },
    'org.openedx.frontend.authoring.course_outline_header_actions.v1': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'auto-prereq-gating-button',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: AutoGatingButton,
          },
        },
      ],
    },
  },
};

export default config;
