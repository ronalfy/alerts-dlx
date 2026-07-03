import "./editor.scss";

/**
 * External dependencies
 */
import { useState, useEffect, createRef } from "@wordpress/element";
import classNames from "classnames";

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { UP, DOWN, ENTER, TAB } from "@wordpress/keycodes";
import { speak } from "@wordpress/a11y";
import { Button, Spinner } from "@wordpress/components";
import { useInstanceId, useDebounce } from "@wordpress/compose";
import { filterURLForDisplay } from "@wordpress/url";
import apiFetch from "@wordpress/api-fetch";
import { search, keyboardReturn, closeSmall, external, page, post } from "@wordpress/icons";

const SEARCH_PAGES_PATH = "/dlxplugins/alerts-dlx/v1/search/pages";

import isURL from "../../utils/isURL";

/**
 * URL picker for searching posts/pages or pasting a URL.
 *
 * @param {Object} props Incoming props.
 * @return {import('react').JSX.Element} URLPicker component.
 */
const URLPicker = (props) => {
  const inputRef = createRef();

  const {
    label = __("Page", "alerts-dlx"),
    onItemSelect = () => {},
    onItemClear = () => {},
    hasInititialFocus = false,
    savedValue,
    prefillInputValue = "",
  } = props;

  const generatedUniqueId = useInstanceId(URLPicker, "app");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestionRequest, setCurrentSuggestionRequest] =
    useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);
  const [suggestionListboxId] = useState("");
  const [suggestionValue, setSuggestionValue] = useState(
    prefillInputValue || ""
  );
  const [savedSuggestionValue, setSavedSuggestionValue] = useState(
    prefillInputValue ? "" : savedValue
  );
  const [uniqueInstanceId] = useState(`url-input-control-${generatedUniqueId}`);
  const [loading, setLoading] = useState(false);

  const debouncedRequest = useDebounce((value) => {
    updateSuggestions(value);
  }, 200);

  useEffect(() => {
    if ("" !== savedSuggestionValue && null !== savedSuggestionValue) {
      setSuggestionValue(savedSuggestionValue);
      const newSuggestion = {
        permalink: savedSuggestionValue,
        label: filterURLForDisplay(savedSuggestionValue),
        slug: "",
        value: "",
      };
      setSavedSuggestionValue("");
      setCurrentSuggestion(newSuggestion);
      return;
    }
    if ("" !== suggestionValue) {
      debouncedRequest(suggestionValue);
    }
  }, [suggestionValue]);

  useEffect(() => {
    if (prefillInputValue === "" && !savedSuggestionValue) {
      setCurrentSuggestion(null);
      setSavedSuggestionValue(null);
      setSuggestionValue("");
    }
  }, [prefillInputValue]);

  const onChange = (event) => {
    setSuggestionValue(event.target.value);
  };

  const onFocus = (event) => {
    event.preventDefault();
    if (
      null === selectedSuggestion &&
      "" !== suggestionValue &&
      !isURL(suggestionValue)
    ) {
      debouncedRequest(suggestionValue);
    }
  };

  const onKeyDown = (event) => {
    if ((!showSuggestions && !suggestions.length) || loading) {
      switch (event.keyCode) {
        case UP: {
          if (0 !== event.target.selectionStart) {
            event.preventDefault();
            event.target.setSelectionRange(0, 0);
          }
          break;
        }
        case DOWN: {
          if (suggestionValue !== event.target.selectionStart) {
            event.preventDefault();
            event.target.setSelectionRange(
              suggestionValue.length,
              suggestionValue.length
            );
          }
          break;
        }
        case ENTER: {
          event.preventDefault();
          if (isURL(event.target.value)) {
            onItemSelect(event, event.target.value);
            inputRef.current.focus();
            return;
          } else {
            debouncedRequest(event.target.value);
          }
          break;
        }
      }

      return null;
    }

    switch (event.keyCode) {
      case UP: {
        event.preventDefault();
        const previousIndex = !selectedSuggestionIndex
          ? suggestions.length - 1
          : selectedSuggestionIndex - 1;
        setSelectedSuggestionIndex(previousIndex);
        setSelectedSuggestion(suggestions[previousIndex].value);
        break;
      }
      case DOWN: {
        event.preventDefault();
        if (!showSuggestions && suggestions.length > 0) {
          setShowSuggestions(true);
          setSelectedSuggestionIndex(0);
          setSelectedSuggestion(suggestions[0].value);
          return;
        }
        const nextIndex =
          selectedSuggestion === null ||
          selectedSuggestionIndex === suggestions.length - 1
            ? 0
            : selectedSuggestionIndex + 1;
        setSelectedSuggestionIndex(nextIndex);
        setSelectedSuggestion(suggestions[nextIndex].value);
        break;
      }
      case TAB: {
        if (selectedSuggestion !== null) {
          speak(__("Link selected.", "alerts-dlx"));
        }
        break;
      }
      case ENTER: {
        event.preventDefault();

        if (selectedSuggestion !== null) {
          const suggestion = getSuggestion(selectedSuggestion);
          if (suggestion?.permalink) {
            onItemSelect(event, suggestion.permalink);
          }
          setShowSuggestions(false);
          inputRef.current.focus();
        }

        break;
      }
    }
  };

  const getSuggestion = (value) => {
    const foundSuggestion = suggestions.find(
      (suggestion) => suggestion.value === value
    );
    if (null === foundSuggestion || undefined === foundSuggestion) {
      return null;
    }
    return foundSuggestion;
  };

  const updateSuggestions = (value = "") => {
    const isInitialSuggestions = !value?.length;

    value = value.toString();
    value = value.trim();

    if (isURL(value)) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    if (!isInitialSuggestions && value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);

      return;
    }

    setSelectedSuggestion(null);
    setLoading(true);

    const abortController = new AbortController();
    if (null !== currentSuggestionRequest) {
      currentSuggestionRequest.abort();
    }
    setCurrentSuggestionRequest(abortController);

    (async () => {
      try {
        setLoading(true);
        const results = await apiFetch({
          path: SEARCH_PAGES_PATH,
          method: "POST",
          data: { search: value },
          signal: abortController.signal,
        });

        setCurrentSuggestionRequest(null);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (error) {
        if ("AbortError" === error?.name) {
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="alerts-dlx-url-input">
      <div className="alerts-dlx-pub-url-input__wrapper">
        {null !== currentSuggestion && (
          <div className="alerts-dlx-pub-url-input__suggestion">
            <div className="alerts-dlx-pub-url-input__suggestion-item">
              <span className="alerts-dlx-pub-url-input__suggestion-label">
                <Button
                  variant="link"
                  icon={external}
                  iconPosition="right"
                  label={__("Open in new tab", "alerts-dlx")}
                  href={currentSuggestion.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {filterURLForDisplay(currentSuggestion.permalink)}
                </Button>
              </span>
              <Button
                variant="secondary"
                icon={closeSmall}
                label={__("Remove Current Selection", "alerts-dlx")}
                onClick={() => {
                  setCurrentSuggestion(null);
                  setSuggestionValue("");
                  onItemClear();
                }}
              />
            </div>
          </div>
        )}

        <div className="alerts-dlx-pub-url-input__input-wrapper">
          {null === currentSuggestion && (
            <div className="alerts-dlx-pub-url-search-wrapper">
              <input
                type="text"
                placeholder={__("Paste in URL or search", "alerts-dlx")}
                id={uniqueInstanceId}
                className="alerts-dlx-pub-url-input__input"
                value={suggestionValue}
                onChange={onChange}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                aria-label={label ? undefined : __("Page", "alerts-dlx")}
                aria-autocomplete="list"
                ref={inputRef}
              />
              {loading && (
                <div className="alerts-dlx-pub-url-input__loading">
                  <Spinner />
                </div>
              )}
              {!loading && !isURL(suggestionValue) && (
                <Button
                  className="alerts-dlx-pub-url-input__search-button"
                  icon={search}
                  label={__("Search for a Page", "alerts-dlx")}
                  onClick={() => {
                    setShowSuggestions(true);
                  }}
                />
              )}
              {!loading && isURL(suggestionValue) && (
                <Button
                  className="alerts-dlx-pub-url-input__apply-button"
                  icon={keyboardReturn}
                  label={__("Apply Link", "alerts-dlx")}
                  onClick={(e) => {
                    const newSuggestion = {
                      permalink: suggestionValue,
                      label: filterURLForDisplay(suggestionValue),
                      slug: "",
                      value: "",
                    };
                    setCurrentSuggestion(newSuggestion);
                    onItemSelect(e, suggestionValue);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {showSuggestions && !!suggestions.length && (
        <div className="alerts-dlx-suggestions-wrapper">
          <div
            role="listbox"
            id={suggestionListboxId}
            className="alerts-dlx-url-input__suggestions"
          >
            {suggestions.map((suggestion, index) => {
              const suggestionId = `alerts-dlx-suggested-value-${suggestion.value}`;
              const suggestionClass = classNames(
                "alerts-dlx-url-input__suggestion",
                {
                  "is-selected": suggestion.value === selectedSuggestion,
                }
              );

              return (
                <Button
                  key={suggestionId}
                  id={suggestionId}
                  value={suggestion.value}
                  role="option"
                  aria-selected={suggestion.value === selectedSuggestion}
                  className={suggestionClass}
                  onClick={(e) => {
                    setSelectedSuggestion(parseInt(e.target.value, 10));
                    setSelectedSuggestionIndex(index);
                    setCurrentSuggestion(suggestion);
                    setShowSuggestions(false);
                    onItemSelect(e, suggestion.permalink);
                  }}
                  icon={"post" === suggestion.type ? post : page}
                  iconPosition="left"
                >
                  <span className="alerts-dlx-search-item">
                    <span className="alerts-dlx-search-item-title">
                      {suggestion.label}
                    </span>
                    <span className="alerts-dlx-search-item-info">
                      {suggestion.permalink}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default URLPicker;
