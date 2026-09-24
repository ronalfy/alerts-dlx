import { useState, Suspense, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { useForm, Controller, useFormState } from "react-hook-form";
import { useAsyncResource } from "use-async-resource";
import {
  RadioControl,
  ToggleControl,
  TextControl,
  Fill,
  Notice,
} from "@wordpress/components";
import SaveBar from "../Components/SaveBar";
import Snackbar from "../Components/Snackbar";
import Loader from "../Components/Loader";
import BlockStylesControl from "../Components/BlockStylesControl";
import sendCommand from "../Utils/SendCommand";
import ShortcodeBuilder from "./ShortcodeBuilder";

const Settings = () => {

  return (
    <>
      <div className="adlx-admin-content-wrapper">
        <div className="adlx-admin-content-panel">
          <div className="adlx-admin-content-heading">
            <h1>
              <span className="adlx-admin-content-heading-text">
                {__("AlertsDLX Shortcode Builder", "alerts-dlx")}
              </span>
            </h1>
            <p className="description">
              {__(
                "Build custom shortcodes for your AlertsDLX alerts.",
                "alerts-dlx"
              )}
            </p>
          </div>
        </div>
      <ShortcodeBuilder />
	  </div>
    </>
  );
};

export default Settings;
