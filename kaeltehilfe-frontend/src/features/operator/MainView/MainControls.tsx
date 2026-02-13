import { ActionIcon, Button, Group, rem } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useField } from "@mantine/form";
import { IconArrowForwardUpDouble, IconListDetails } from "@tabler/icons-react";
import React from "react";
import { compareByDateOnly } from "../../../common/utils";

type MainControlsProps = {
  queryFrom: Date;
  today: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  toggleDetailsOpen: () => void;
};
export const MainControls = ({
  queryFrom,
  today,
  setSelectedDate,
  selectedDate,
  toggleDetailsOpen,
}: MainControlsProps) => {
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
    <Group justify="space-between" mb="md" align="flex-end">
      <Group align="flex-end">
        <DatePickerInput
          w={rem(350)}
          {...dateField.getInputProps()}
          label="Datum"
          type="default"
          valueFormat="DD MMMM YYYY"
          minDate={queryFrom}
          maxDate={today}
          modalProps={{ zIndex: 900 }}
          popoverProps={{ zIndex: 900 }}
          // dropdownType="modal"
          highlightToday
          rightSection={
            <JumpToTodayButton onClick={() => setSelectedDate(defaultDate)} />
          }
          onChange={(value) => {
            if (!value) return;
            setSelectedDate(value);
          }}
        />

        <Button
          size="sm"
          variant="default"
          onClick={() => setSelectedDate(defaultDate)}
          disabled={compareByDateOnly(defaultDate, selectedDate) === 0}
          rightSection={<IconArrowForwardUpDouble />}
        >
          Heute
        </Button>
      </Group>

      <Button
        size="sm"
        variant="default"
        onClick={toggleDetailsOpen}
        rightSection={<IconListDetails />}
      >
        Kacheln
      </Button>
    </Group>
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
