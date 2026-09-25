import { __ } from "@wordpress/i18n";
import LibraryList from "./LibraryList";
import LibraryEditor from "./LibraryEditor";

/**
 * Alert library admin shell for global styles and snapshots.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.libraryKind  Library kind slug for new items.
 * @param {string}   props.view         list or edit.
 * @param {number}   props.itemId       Item ID when editing.
 * @param {Function} props.onNavigate   Route change handler.
 * @return {Element} App markup.
 */
const App = ({ libraryKind, view, itemId, onNavigate }) => {
	const isEdit = "edit" === view;

	return (
		<div className="adlx-admin-content-wrapper alerts-dlx-library">
			<div className="adlx-admin-content-panel">
				<div className="adlx-admin-content-heading">
					<h1>
						<span className="adlx-admin-content-heading-text">
							{__("Global Styles and Snapshots", "alerts-dlx")}
						</span>
					</h1>
					<p className="description">
						{__(
							"Reusable appearance presets. Global styles are meant to be referenced. Snapshots are meant to be applied as a copy.",
							"alerts-dlx"
						)}
					</p>
				</div>

				{isEdit ? (
					<div className="adlx-admin-content-body">
						<LibraryEditor
							libraryKind={libraryKind}
							itemId={itemId}
							onBack={() => onNavigate("list", 0)}
							onSaved={(saved) => onNavigate("edit", saved.id, saved.kind)}
							onKindChange={(nextKind) => onNavigate("edit", itemId, nextKind)}
						/>
					</div>
				) : (
					<div className="adlx-admin-content-body">
						<LibraryList
							onAdd={(nextKind) => onNavigate("edit", 0, nextKind)}
							onEdit={(id) => onNavigate("edit", id)}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
