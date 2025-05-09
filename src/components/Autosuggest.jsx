import React, { useState } from 'react';
import { useCombobox } from 'downshift';
import { generateSuggestions, fuzzyMatch } from '../utils/autosuggestUtils';

function Autosuggest({ cities, settings, setSettings, classes, disabled }) {
  const [inputValue, setInputValue] = useState(settings.city || '');

  const suggestions = generateSuggestions(inputValue, cities);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: suggestions,
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue);
      setSettings({ ...settings, city: inputValue });
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSettings({ ...settings, city: selectedItem });
        setInputValue(selectedItem);
      }
    },
  });

  const handleBlur = () => {
    if (!inputValue || !cities) return;
    const exactMatch = cities.find((city) => city.toLowerCase() === inputValue.toLowerCase());
    if (exactMatch) {
      setSettings({ ...settings, city: exactMatch });
      setInputValue(exactMatch);
      return;
    }
    const bestMatch = cities
      .map((city) => ({ city, score: fuzzyMatch(inputValue, city) }))
      .sort((a, b) => b.score - a.score)[0];
    if (bestMatch && bestMatch.score > 0.7) {
      setSettings({ ...settings, city: bestMatch.city });
      setInputValue(bestMatch.city);
    }
  };

  return (
    <div className="relative">
      <input
        {...getInputProps({
          onBlur: handleBlur,
          className: classes.autosuggest,
          placeholder: 'Type your city',
          disabled,
        })}
      />
      <ul
        {...getMenuProps()}
        className={`absolute w-full ${classes.autosuggestSuggestions} ${
          isOpen && suggestions.length > 0 ? 'block' : 'hidden'
        }`}
      >
        {isOpen &&
          suggestions.map((item, index) => (
            <li
              {...getItemProps({ item, index })}
              className={`${classes.autosuggestSuggestion} ${
                highlightedIndex === index ? classes.autosuggestHighlighted : ''
              }`}
              key={item}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Autosuggest;