# Studio Home Bulk Reruns Slot

`org.cucwd.frontend.authoring.studio_home_bulk_reruns.v1`

## Slot location

Rendered after the tab bar in the Studio Home (`/home`) page.

## Slot content

Empty by default. Intended for `frontend-plugin-bulk-rerun` to insert the `BulkRerunsTab` component.

## Example configuration

```jsx
// env.config.jsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { BulkRerunsTab } from '@cucwd/frontend-plugin-bulk-rerun';

const config = {
  ...process.env,
  pluginSlots: {
    'org.cucwd.frontend.authoring.studio_home_bulk_reruns.v1': {
      keepDefault: false,
      plugins: [{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'bulk_reruns_tab',
          type: DIRECT_PLUGIN,
          priority: 50,
          RenderWidget: BulkRerunsTab,
        },
      }],
    },
  },
};
export default config;
```
