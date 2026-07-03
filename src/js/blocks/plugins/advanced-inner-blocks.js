import { ToggleControl, PanelRow, Fill } from "@wordpress/components";
import { registerPlugin } from "@wordpress/plugins";
import { __ } from "@wordpress/i18n";
registerPlugin("alerts-dlx-advanced-inner-blocks-slot-fills", {
  render: () => {
    return (
      <Fill name="alertsDLXSettingsPanelEnd">
        {({ attributes, setAttributes }) => {
          const { innerBlocksEnabled } = attributes;

          return (
            <>
              <PanelRow>
                <ToggleControl
                  label={__(
                    "Flexible InnerBlocks (Advanced)",
                    "alerts-dlx"
                  )}
                  checked={innerBlocksEnabled}
                  onChange={(value) => {
                    setAttributes({
                      innerBlocksEnabled: value,
                    });
                  }}
                  help={__(
                    "Allows any block in the alert body. AlertsDLX styles the alert shell and default paragraph description text. Lists and other inner blocks may inherit your theme or block styles. Leave this off for simple alert text.",
                    "alerts-dlx"
                  )}
                />
              </PanelRow>
            </>
          );
        }}
      </Fill>
    );
  },
});
