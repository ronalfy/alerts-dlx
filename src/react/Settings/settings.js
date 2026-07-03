import { useState, Suspense, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { useForm, Controller, useFormState } from "react-hook-form";
import { useAsyncResource } from "use-async-resource";
import {
  RadioControl,
  ToggleControl,
  Fill,
  Notice,
} from "@wordpress/components";
import SaveBar from "../Components/SaveBar";
import Snackbar from "../Components/Snackbar";
import Loader from "../Components/Loader";
import BlockStylesControl from "../Components/BlockStylesControl";
import sendCommand from "../Utils/SendCommand";

let checkpointData = null;

const retrieveDefaults = () => {
  return sendCommand("alerts_dlx_retrieve_settings", {
    nonce: alertsDlxAdmin.retrieveNonce,
  });
};

const Settings = () => {
  const [defaults, getDefaults] = useAsyncResource(retrieveDefaults, []);

  return (
    <Suspense
      fallback={
        <Loader
          title={__("AlertsDLX Settings", "alerts-dlx")}
          label={__("Loading…", "alerts-dlx")}
        />
      }
    >
      <Interface defaults={defaults} />
    </Suspense>
  );
};

const Interface = ({ defaults }) => {
  const response = defaults();
  const { data, success } = response.data;

  if (!success || !data?.values) {
    return (
      <Notice status="error" isDismissible={false}>
        {__("Could not load AlertsDLX settings.", "alerts-dlx")}
      </Notice>
    );
  }

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [ajaxError, setAjaxError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: __("Settings saved successfully.", "alerts-dlx"),
    type: "success",
  });

  const getDefaultValues = () => ({
    headlineStyle: data.values.headlineStyle || "h2",
    enabledBlockStyles: data.values.enabledBlockStyles || [],
    debugMode: data.values.debugMode || false,
  });

  const { control, reset, getValues } = useForm({
    defaultValues: getDefaultValues(),
  });

  const { isDirty } = useFormState({ control });

  useEffect(() => {
    checkpointData = getDefaultValues();
  }, [data]);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({
      isVisible: true,
      message,
      type,
    });
  };

  const handleSave = () => {
    const formValues = getValues();

    if (!formValues.enabledBlockStyles?.length) {
      setAjaxError(
        __("At least one alert theme must remain enabled.", "alerts-dlx")
      );
      return;
    }

    setSaving(true);
    setAjaxError(null);

    sendCommand("alerts_dlx_save_settings", {
      nonce: alertsDlxAdmin.saveNonce,
      form_data: formValues,
    })
      .then((ajaxResponse) => {
        if (!ajaxResponse.data.success) {
          throw new Error(
            ajaxResponse.data.data?.message ||
              __("Could not save settings.", "alerts-dlx")
          );
        }

        const savedValues = ajaxResponse.data.data.values;
        reset({
          headlineStyle: savedValues.headlineStyle,
          enabledBlockStyles: savedValues.enabledBlockStyles,
          debugMode: savedValues.debugMode,
        });
        checkpointData = savedValues;
        showSnackbar(__("Settings saved successfully.", "alerts-dlx"));
      })
      .catch((error) => {
        setAjaxError(
          error.message || __("Could not save settings.", "alerts-dlx")
        );
        showSnackbar(__("Could not save settings.", "alerts-dlx"), "error");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleReset = () => {
    setResetting(true);
    setAjaxError(null);

    sendCommand("alerts_dlx_reset_settings", {
      nonce: alertsDlxAdmin.resetNonce,
    })
      .then((ajaxResponse) => {
        if (!ajaxResponse.data.success) {
          throw new Error(__("Could not reset settings.", "alerts-dlx"));
        }

        const savedValues = ajaxResponse.data.data.values;
        reset({
          headlineStyle: savedValues.headlineStyle,
          enabledBlockStyles: savedValues.enabledBlockStyles,
          debugMode: savedValues.debugMode,
        });
        checkpointData = savedValues;
        showSnackbar(__("Settings reset to defaults.", "alerts-dlx"));
      })
      .catch(() => {
        showSnackbar(__("Could not reset settings.", "alerts-dlx"), "error");
      })
      .finally(() => {
        setResetting(false);
      });
  };

  const handleDiscard = () => {
    if (checkpointData) {
      reset({
        headlineStyle: checkpointData.headlineStyle,
        enabledBlockStyles: checkpointData.enabledBlockStyles,
        debugMode: checkpointData.debugMode,
      });
    }
    setAjaxError(null);
  };

  const enabledBlockStyles = getValues("enabledBlockStyles");
  const hasErrors = !enabledBlockStyles?.length;

  return (
    <>
      <div className="adlx-admin-content-wrapper">
        <div className="adlx-admin-content-panel">
          <div className="adlx-admin-content-heading">
            <h1>
              <span className="adlx-admin-content-heading-text">
                {__("AlertsDLX Settings", "alerts-dlx")}
              </span>
            </h1>
            <p className="description">
              {__(
                "Configure global AlertsDLX options for your site.",
                "alerts-dlx"
              )}
            </p>
          </div>

          {ajaxError && (
            <Notice status="error" isDismissible={false}>
              {ajaxError}
            </Notice>
          )}

          <div className="adlx-admin-content-body">
            <div className="adlx-admin-component-wrapper">
              <h3 className="adlx-admin-content-subheading">
                {__("Headline Style", "highlight-and-share")}
              </h3>
              <div className="adlx-admin-component-row">
                <p className="description">
                  {__(
                    "Choose the HTML element used for alert titles across your site.",
                    "alerts-dlx"
                  )}
                </p>
              </div>
              <div className="adlx-admin-component-row">
                <Controller
                  name="headlineStyle"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <RadioControl
                      label={__("Title Element", "alerts-dlx")}
                      selected={value}
                      options={data.headlineStyleOptions || []}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div className="adlx-admin-content-body">
            <div className="adlx-admin-component-wrapper">
              <h3 className="adlx-admin-content-subheading">
                {__("Alert Themes", "alerts-dlx")}
              </h3>
              <div className="adlx-admin-component-row">
                <p className="description">
                  {__(
                    "Select which alert themes are available in the block inserter. This will not affect existing alerts on your site.",
                    "alerts-dlx"
                  )}
                </p>
              </div>
              <div className="adlx-admin-component-row">
                <Controller
                  name="enabledBlockStyles"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <BlockStylesControl
                      options={data.blockStyleOptions || []}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div className="adlx-admin-content-body">
            <div className="adlx-admin-component-wrapper">
              <h3 className="adlx-admin-content-subheading">
                {__("Debug Mode", "alerts-dlx")}
              </h3>
              <div className="adlx-admin-component-row">
                <p className="description">
                  {__(
                    "Show useful information in the admin area for debugging purposes.",
                    "alerts-dlx"
                  )}
                </p>
              </div>
              <div className="adlx-admin-component-row">
                <Controller
                  name="debugMode"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <ToggleControl
                      label={__("Enable Debug Mode", "alerts-dlx")}
                      checked={value}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Fill name="alertsDlxSettingsFooter">
        <Snackbar
          isVisible={snackbar.isVisible}
          message={snackbar.message}
          type={snackbar.type}
          onClose={() =>
            setSnackbar((current) => ({ ...current, isVisible: false }))
          }
        />
        <SaveBar
          onSave={handleSave}
          onReset={handleReset}
          onDiscardChanges={handleDiscard}
          isSaving={saving}
          isResetting={resetting}
          isDirtyFields={isDirty}
          hasErrors={hasErrors}
        />
      </Fill>
    </>
  );
};

export default Settings;
