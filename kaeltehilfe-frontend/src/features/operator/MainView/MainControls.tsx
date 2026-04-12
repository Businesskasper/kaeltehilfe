import { ActionIcon, Button, Group, rem } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useField } from "@mantine/form";
import {
  IconArrowForwardUpDouble,
  IconListDetails,
  IconMessage,
  IconPlus,
  IconSoup,
} from "@tabler/icons-react";
import React from "react";
import { compareByDateOnly, useIsMobile } from "../../../common/utils";

type MainControlsProps = {
  queryFrom: Date;
  today: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  toggleDetailsOpen: () => void;
  onAddDistribution: () => void;
  onAddComment: () => void;
};
export const MainControls = ({
  queryFrom,
  today,
  setSelectedDate,
  selectedDate,
  toggleDetailsOpen,
  onAddDistribution,
  onAddComment,
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

  const isMobile = useIsMobile();

  return (
    <Group justify="space-between" mb="md" align="flex-end">
      <Group align="flex-end">
        <DatePickerInput
        size={isMobile ? 'xs' : 'sm'}
          w={rem(175)}
          {...dateField.getInputProps()}
          label="Datum"
          type="default"
          valueFormat="DD MMMM YYYY"
          minDate={queryFrom}
          maxDate={today}
          modalProps={{ zIndex: 900 }}
          popoverProps={{ zIndex: 900 }}
          highlightToday
          onChange={(value) => {
            if (!value) return;
            setSelectedDate(value);
          }}
        />

        {isMobile ? (
          <ActionIcon
            size="md"
            variant="default"
            onClick={() => setSelectedDate(defaultDate)}
            disabled={compareByDateOnly(defaultDate, selectedDate) === 0}
          >
            <IconArrowForwardUpDouble size={14} />
          </ActionIcon>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={() => setSelectedDate(defaultDate)}
            disabled={compareByDateOnly(defaultDate, selectedDate) === 0}
            rightSection={<IconArrowForwardUpDouble />}
          >
            Heute
          </Button>
        )}
      </Group>

      <Group gap="xs">
        {isMobile ? (
          <>
            <ActionIcon size="md" variant="default" onClick={toggleDetailsOpen}>
              <IconListDetails size={14} />
            </ActionIcon>
            <ActionIcon size="md" variant="filled" onClick={onAddDistribution}>
              <IconSoup size={14} />
            </ActionIcon>
            <ActionIcon size="md" variant="filled" onClick={onAddComment}>
              <IconMessage size={14} />
            </ActionIcon>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={toggleDetailsOpen}
              rightSection={<IconListDetails />}
            >
              Kacheln
            </Button>
            <Button
              size="sm"
              variant="filled"
              leftSection={<IconPlus size={14} />}
              rightSection={<IconSoup size={14} />}
              onClick={onAddDistribution}
            >
              Ausgabe
            </Button>
            <Button
              size="sm"
              variant="filled"
              leftSection={<IconPlus size={14} />}
              rightSection={<IconMessage size={14} />}
              onClick={onAddComment}
            >
              Kommentar
            </Button>
          </>
        )}
      </Group>
    </Group>
  );
};
