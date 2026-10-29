import BuilderField from "./BuilderField";
import { groupLabels, groupColorFields, isFieldVisible } from "./builder-utils";

/**
 * Schema-driven alert builder inspector sections.
 *
 * @param {Object}   props               Component props.
 * @param {Array}    props.fields        Field metadata.
 * @param {Object}   props.values        Current values.
 * @param {Function} props.onChange      Field change handler.
 * @param {Function} props.onSelectImage Media picker handler.
 * @param {Array}    props.lockedFieldNames Field names that stay visible but cannot be edited.
 * @return {Element} Inspector markup.
 */
const AlertBuilderInspector = ({
  fields,
  values,
  onChange,
  onSelectImage,
  lockedFieldNames = [],
}) => {
  const renderField = (field) => {
    const control = (
      <BuilderField
        field={field}
        values={values}
        onChange={onChange}
        onSelectImage={onSelectImage}
      />
    );
    return (
      <div className="adlx-admin-component-row" key={field.name}>
        {lockedFieldNames.includes(field.name) ? (
          <fieldset
            disabled
            className="alerts-dlx-shortcode-builder-locked-field"
          >
            {control}
          </fieldset>
        ) : (
          control
        )}
      </div>
    );
  };

  return Object.entries(groupLabels).map(([group, label]) => {
    const groupFields = fields.filter(
      (field) => field.group === group && isFieldVisible(field, values)
    );
    if (!groupFields.length) {
      return null;
    }
    return (
      <div
        className={`adlx-admin-content-body${
          "colors" === group ? " alerts-dlx-shortcode-builder-colors" : ""
        }`}
        key={group}
      >
        <div className="adlx-admin-component-wrapper">
          <h3 className="adlx-admin-content-subheading">{label}</h3>
          {"colors" === group
            ? groupColorFields(groupFields).map((section) => (
                <div
                  className="alerts-dlx-shortcode-builder-color-subgroup"
                  key={section.subgroup || "colors"}
                >
                  {section.subgroup && (
                    <h4 className="alerts-dlx-shortcode-builder-color-subgroup-title">
                      {section.subgroup}
                    </h4>
                  )}
                  {section.fields.map((field) => renderField(field))}
                </div>
              ))
            : groupFields.map((field) => renderField(field))}
        </div>
      </div>
    );
  });
};

export default AlertBuilderInspector;
