/* eslint-disable no-undef */
import { createRoot, StrictMode, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import App from "../AlertLibrary/App";

const container = document.getElementById("alerts-dlx-global-styles");

if (container) {
	const adminConfig = window.alertsDlxAdmin || {};

	if (adminConfig.restNonce) {
		apiFetch.use(apiFetch.createNonceMiddleware(adminConfig.restNonce));
	}
	if (adminConfig.restUrl) {
		apiFetch.use(apiFetch.createRootURLMiddleware(adminConfig.restUrl));
	}

	const boot = adminConfig.globalStylesBoot || {};

	const Root = () => {
		const [view, setView] = useState(boot.view || "list");
		const [itemId, setItemId] = useState(boot.itemId || 0);

		const onNavigate = (nextView, nextId) => {
			setView(nextView);
			setItemId(nextId);

			const url = new URL(window.location.href);
			if ("edit" === nextView) {
				url.searchParams.set("subtab", "edit");
				if (nextId) {
					url.searchParams.set("style", String(nextId));
				} else {
					url.searchParams.delete("style");
				}
			} else {
				url.searchParams.delete("subtab");
				url.searchParams.delete("style");
			}
			window.history.replaceState({}, "", url.toString());
		};

		return (
			<App
				libraryKind="global_style"
				view={view}
				itemId={itemId}
				onNavigate={onNavigate}
			/>
		);
	};

	container.innerHTML = "";
	const root = createRoot(container);
	root.render(
		<StrictMode>
			<Root />
		</StrictMode>
	);
} else if (typeof window !== "undefined") {
	// eslint-disable-next-line no-console
	console.error(
		"AlertsDLX: Global Styles mount point #alerts-dlx-global-styles was not found."
	);
}
