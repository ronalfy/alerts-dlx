/* eslint-disable no-undef */
import { createRoot, StrictMode, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import App from "./App";
import { KIND_GLOBAL_STYLE } from "./kind-labels";

const container = document.getElementById("alerts-dlx-library");

if (container) {
	const adminConfig = window.alertsDlxAdmin || {};

	if (adminConfig.restNonce) {
		apiFetch.use(apiFetch.createNonceMiddleware(adminConfig.restNonce));
	}
	if (adminConfig.restUrl) {
		apiFetch.use(apiFetch.createRootURLMiddleware(adminConfig.restUrl));
	}

	const boot = adminConfig.libraryBoot || {};

	const Root = () => {
		const [view, setView] = useState(boot.view || "list");
		const [itemId, setItemId] = useState(boot.itemId || 0);
		const [kind, setKind] = useState(boot.kind || KIND_GLOBAL_STYLE);

		const onNavigate = (nextView, nextId, nextKind) => {
			setView(nextView);
			setItemId(nextId);
			if (nextKind) {
				setKind(nextKind);
			}

			const url = new URL(window.location.href);
			if ("edit" === nextView) {
				url.searchParams.set("subtab", "edit");
				if (nextId) {
					url.searchParams.set("item", String(nextId));
					url.searchParams.delete("kind");
				} else {
					url.searchParams.delete("item");
					url.searchParams.set("kind", nextKind || kind);
				}
			} else {
				url.searchParams.delete("subtab");
				url.searchParams.delete("item");
				url.searchParams.delete("kind");
			}
			window.history.replaceState({}, "", url.toString());
		};

		return (
			<App
				libraryKind={kind}
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
		"AlertsDLX: Library mount point #alerts-dlx-library was not found."
	);
}
