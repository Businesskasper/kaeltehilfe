import {
  Combobox,
  Input,
  InputBase,
  MantineStyleProp,
  useCombobox,
} from "@mantine/core";
import React from "react";
import { ValueTypeProps } from "../../../utils";

import { useForm } from "@mantine/form";
import "./FormSelect.scss";

export type FormSelectProps<T extends { [key in string]: unknown }> = {
  items: Array<T>;
  valueGetter:
    | ValueTypeProps<T, string | undefined>
    | ((item: T) => string | undefined); // TODO of type
  disabledGetter?: ValueTypeProps<T, boolean> | ((item: T) => boolean); // TODO of type
  sort?: boolean;
  style?: MantineStyleProp;
  classNames?: string;
  onItemSelected?: (item: T | undefined) => void;
  formProps: ReturnType<ReturnType<typeof useForm>["getInputProps"]>;
};

export const FormSelect = <T extends { [key in string]: unknown }>({
  items,
  valueGetter,
  disabledGetter,
  sort,
  style,
  classNames,
  onItemSelected,
  formProps,
}: FormSelectProps<T>) => {
  const getItemValue = React.useCallback(
    (item: T) => {
      return (
        (typeof valueGetter === "function"
          ? valueGetter(item)
          : (item[valueGetter] as string | undefined)) || ""
      );
    },
    [valueGetter]
  );

  const getItemDisabled = React.useCallback(
    (item: T) => {
      return !disabledGetter
        ? false
        : typeof disabledGetter === "function"
        ? disabledGetter(item)
        : (item[disabledGetter] as boolean); // TODO: find out why casting is necessary
    },
    [disabledGetter]
  );

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    loop: true,
  });

  // const [value, setValue] = React.useState<string | null>(null);

  const options = React.useMemo(() => {
    const selectableItems = items.map((item) => ({
      value: getItemValue(item),
      isDisabled: getItemDisabled(item),
      item,
    }));
    return sort
      ? selectableItems.sort((a, b) => a.value.localeCompare(b.value))
      : selectableItems;
  }, [getItemDisabled, getItemValue, items, sort]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val, prop) => {
        console.log("selected", val, prop);

        formProps.onChange(prop.children);

        onItemSelected && onItemSelected(val as unknown as T | undefined);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target withKeyboardNavigation>
        <InputBase
          classNames={{ root: `FormSelect ${classNames}` }}
          style={style}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {formProps.value || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        {options.map((option, index) => {
          return (
            <Combobox.Option
              value={option.item as unknown as string}
              disabled={option.isDisabled}
              key={`${option.value}_${index}`}
            >
              {option.value}
            </Combobox.Option>
          );
        })}
      </Combobox.Dropdown>
    </Combobox>
  );
};
