import {
  ActionIcon,
  Combobox,
  Input,
  InputBase,
  MantineStyleProp,
  ScrollArea,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { ValueTypeProps } from "../../../utils";

import { IconX } from "@tabler/icons-react";
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
  searchable?: boolean;
  onBlur?: () => void;
  label?: string;
  withAsterisk?: boolean;
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
  searchable,
  onBlur,
  label,
  withAsterisk,
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
    scrollBehavior: "smooth",
  });

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

  // const shouldFilterOptions = !options.some(
  //   (option) => option.value === formProps.value
  // );
  // const filteredOptions = React.useMemo(() => {
  //   return shouldFilterOptions
  //     ? options.filter((option) =>
  //         option.value
  //           .toLowerCase()
  //           .includes(formProps.value.toLowerCase().trim())
  //       )
  //     : options;
  // }, [formProps.value, options, shouldFilterOptions]);
  const filteredOptions = React.useMemo(() => {
    const currentValue =
      typeof formProps.value === "string"
        ? formProps?.value?.toLowerCase()?.trim()
        : formProps.value;
    return currentValue
      ? options.filter((option) =>
          option.value?.toLowerCase()?.includes(currentValue)
        )
      : options;
  }, [formProps.value, options]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val, prop) => {
        formProps.onChange(prop.children);
        onItemSelected && onItemSelected(val as unknown as T | undefined);
        combobox.closeDropdown();
      }}
      // withinPortal={false}
      withinPortal={true}
    >
      <Combobox.Target withKeyboardNavigation>
        {searchable ? (
          <TextInput
            classNames={{ root: `FormSelect ${classNames}` }}
            label={label}
            withAsterisk={withAsterisk}
            style={style}
            placeholder="Bitte auswählen"
            value={formProps.value}
            onChange={(event) => {
              formProps.onChange(event);
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
              // combobox.clickSelectedOption();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => {
              const currentValue = formProps.value as string;
              if (
                currentValue &&
                (currentValue.startsWith(" ") || currentValue.endsWith(" "))
              ) {
                formProps.onChange(currentValue.trim());
              }
              combobox.closeDropdown();
              formProps.onBlur && formProps.onBlur();
              onBlur && onBlur();
            }}
            error={formProps.error}
            rightSection={
              <ActionIcon
                size="xs"
                disabled={!formProps.value}
                onClick={() => {
                  combobox.resetSelectedOption();
                  formProps.onChange("");
                  onItemSelected && onItemSelected(undefined);
                }}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            }
          />
        ) : (
          <InputBase
            classNames={{ root: `FormSelect ${classNames}` }}
            label={label}
            withAsterisk={withAsterisk}
            style={style}
            component="button"
            type="button"
            pointer
            rightSection={<Combobox.Chevron />}
            rightSectionPointerEvents="none"
            onClick={() => combobox.toggleDropdown()}
            onBlur={() => {
              formProps.onBlur && formProps.onBlur();
              onBlur && onBlur();
            }}
            error={formProps.error}
          >
            {formProps.value || (
              <Input.Placeholder>Bitte auswählen</Input.Placeholder>
            )}
          </InputBase>
        )}
      </Combobox.Target>
      <Combobox.Dropdown
        hidden={!filteredOptions || filteredOptions?.length === 0}
      >
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {filteredOptions.map((option, index) => {
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
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
