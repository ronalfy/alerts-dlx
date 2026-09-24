import { __ } from "@wordpress/i18n";
import LibraryList from "./LibraryList";
import LibraryEditor from "./LibraryEditor";

/**
 * Alert library admin shell (global styles in v1).
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.libraryKind  Library kind slug.
 * @param {string}   props.view         list or edit.
 * @param {number}   props.itemId       Item ID when editing.
 * @param {Function} props.onNavigate   Route change handler.
 * @return {Element} App markup.
 */
const App = ({ libraryKind, view, itemId, onNavigate }) => {
	const isEdit = "edit" === view;

	return (
		<div className="adlx-admin-content-wrapper alerts-dlx-global-styles">
			<div className="adlx-admin-content-panel">
				<div className="adlx-admin-content-heading">
					<h1>
						<span className="adlx-admin-content-heading-text">
							{__("Global Alert Styles", "alerts-dlx")}
						</span>
					</h1>
					<p className="description">
						{__(
							"Manage reusable appearance presets for AlertsDLX alerts.",
							"alerts-dlx"
						)}
					</p>
				</div>

				{isEdit ? (
					<LibraryEditor
						libraryKind={libraryKind}
						itemId={itemId}
						onBack={() => onNavigate("list", 0)}
						onSaved={(saved) => onNavigate("edit", saved.id)}
					/>
				) : (
					<LibraryList
						libraryKind={libraryKind}
						onAdd={() => onNavigate("edit", 0)}
						onEdit={(id) => onNavigate("edit", id)}
					/>
				)}
			</div>
		</div>
	);
};

export default App;
