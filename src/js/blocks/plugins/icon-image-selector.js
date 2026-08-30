import {
  ToggleControl,
  PanelRow,
  Fill,
  Button,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { registerPlugin } from "@wordpress/plugins";
import { __ } from "@wordpress/i18n";
import useMediaUploader from "../hooks/useMediaUploader";
import IconPicker from "../components/IconPicker";
import { getIconSetForBlock } from "../utils/icon-sets";

registerPlugin("custom-slot-fills", {
  render: () => {
    return (
      <Fill name="alertsDLXSettingsPanelEnd">
        {({ attributes, setAttributes, name }) => {
          const { iconSource, imageUrl, imageId, icon, alertGroup } = attributes;

          const { openMediaUploader } = useMediaUploader();

          const getImageButtons = () => {
            return (
              <>
                <div className="alerts-dlx-icon-image-buttons-wrapper">
                  {imageUrl && (
                    <Button
                      variant="secondary"
                      isDestructive={true}
                      onClick={() => {
                        setAttributes({ imageUrl: "", imageId: 0 });
                      }}
                    >
                      {__("Remove Image", "alerts-dlx")}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      openMediaUploader(
                        {
                          title: __("Set Your Image", "alerts-dlx"),
                          buttonLabel: __("Save Image", "alerts-dlx"),
                          removeLabel: __("Remove Image", "alerts-dlx"),
                          suggestedWidth: 96,
                          suggestedHeight: 96,
                          aspectRatio: "1:1",
                          attachmentId: imageId || 0,
                          canSkipCrop: true,
                        },
                        (attachment) => {
                          setAttributes({
                            imageUrl: attachment.url,
                            imageId: attachment.id,
                          });
                        }
                      );
                    }}
                  >
                    {__("Select Image", "alerts-dlx")}
                  </Button>
                </div>
              </>
            );
          };
          const getImage = () => {
            if (!imageUrl) {
              return null;
            }
            return (
              <>
                <img
                  className="alerts-dlx-icon-image"
                  src={imageUrl}
                  alt="Alerts DLX icon"
                />
              </>
            );
          };
          return (
            <>
              <PanelRow>
                <ToggleGroupControl
                  value={iconSource}
                  onChange={(value) => {
                    setAttributes({ iconSource: value });
                  }}
                  label={__("Icon Source", "alerts-dlx")}
                  className="alerts-dlx-icon-source-toggle-group"
                  help={
                    "icon" === iconSource
                      ? __(
                          "Select an icon below, or click the icon in the alert.",
                          "alerts-dlx"
                        )
                      : __(
                          "An image is displayed in the alert. You can edit the image by changing the image below.",
                          "alerts-dlx"
                        )
                  }
                >
                  <ToggleGroupControlOption
                    value="icon"
                    label={__("Icon", "alerts-dlx")}
                  />
                  <ToggleGroupControlOption
                    value="image"
                    label={__("Image", "alerts-dlx")}
                  />
                </ToggleGroupControl>
              </PanelRow>
              {"icon" === iconSource && (
                <PanelRow>
                  <div className="alerts-dlx-icon-sidebar-wrapper">
                    <IconPicker
                      defaultSvg={icon}
                      setAttributes={setAttributes}
                      icons={getIconSetForBlock(name, alertGroup)}
                      popoverPlacement="left-start"
                    />
                  </div>
                </PanelRow>
              )}
              {iconSource === "image" && (
                <PanelRow>
                  <>
                    <div className="alerts-dlx-icon-image-wrapper">
                      {getImage()}
                      {getImageButtons()}
                    </div>
                  </>
                </PanelRow>
              )}
            </>
          );
        }}
      </Fill>
    );
  },
});
