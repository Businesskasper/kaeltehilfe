import { ActionIcon, rem } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useField } from "@mantine/form";
import { IconArrowForwardUpDouble, IconListDetails } from "@tabler/icons-react";
import React from "react";

// const now = new Date();
// const queryTo = new Date(now.setHours(23, 59, 59, 999));
// const queryFrom = new Date(now.setHours(0, 0, 0, 0));

type ViewControlsProps = {
  minDay: Date;
  maxDay: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
};
export const ViewControls = ({
  minDay,
  maxDay,
  setSelectedDate,
  selectedDate,
}: ViewControlsProps) => {
  const [defaultDate] = React.useState(selectedDate);

  const dateField = useField<Date>({
    mode: "controlled",
    initialValue: selectedDate,
    type: "input",
  });

  React.useEffect(() => {
    dateField.setValue(selectedDate);
  }, [dateField, selectedDate]);

  return (
    <div className="view-controls-container">
      <DatePickerInput
        {...dateField.getInputProps()}
        label="Datum"
        mb="sm"
        w="100%"
        type="default"
        valueFormat="DD MMMM YYYY"
        minDate={minDay}
        maxDate={maxDay}
        modalProps={{ zIndex: 900 }}
        popoverProps={{ zIndex: 900 }}
        dropdownType="modal"
        highlightToday
        rightSection={
          <JumpToTodayButton onClick={() => setSelectedDate(defaultDate)} />
        }
        onChange={(value) => {
          if (!value) return;
          setSelectedDate(value);
        }}
      />

      {/* <DateInput
        {...form.getInputProps("from")}
        label="Datum"
        key={form.key("from")}
        placeholder="Datum"
        withAsterisk
        mb="md"
        locale="de"
        valueFormat="DD.MM.YYYY"
        preserveTime={true}
        clearable={false}
        getDayProps={(date) => {
          const exceedsMax = compareByDateOnly(maxDay, date) > 0;
          const exceedsMin = compareByDateOnly(minDay, date) < 0;

          return {
            disabled: exceedsMax || exceedsMin,
          };
        }}
      /> */}
      <ActionIcon h="100%" mt={rem(28)} size="sm" variant="transparent">
        <IconListDetails />
      </ActionIcon>
    </div>
  );
};

const JumpToTodayButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <ActionIcon size="s" onClick={onClick} variant="transparent">
      {/* <IconPlayerSkipForward /> */}
      <IconArrowForwardUpDouble />
    </ActionIcon>
  );
};
