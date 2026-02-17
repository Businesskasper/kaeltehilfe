import { Button, Group, rem } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useField } from "@mantine/form";
import {
  IconMap2,
  IconRectangle,
  IconRectangleVertical,
} from "@tabler/icons-react";
import React from "react";

type DistributionsControlsProps = {
  orientation: "vertical" | "horizontal";
  setOrientation: React.Dispatch<
    React.SetStateAction<"vertical" | "horizontal">
  >;
  rangeFilter: {
    from: Date | null;
    to: Date | null;
  };
  setRangeFilter: React.Dispatch<
    React.SetStateAction<{
      from: Date | null;
      to: Date | null;
    }>
  >;
  isMapOpen: boolean;
  toggleMapOpen: () => void;
};
export const DistributionsControls = ({
  orientation,
  setOrientation,
  rangeFilter,
  setRangeFilter,
  isMapOpen,
  toggleMapOpen,
}: DistributionsControlsProps) => {
  const { from, to } = rangeFilter || {};
  const rangeFilterField = useField<[Date | null, Date | null]>({
    mode: "controlled",
    initialValue: [from, to],
  });

  const value = rangeFilterField.getValue();
  const watchable = JSON.stringify(value);
  React.useEffect(() => {
    const [formFrom, formTo] = value;
    if (
      formFrom?.valueOf() !== from?.valueOf() ||
      formTo?.valueOf() !== to?.valueOf()
    ) {
      setRangeFilter({ from: formFrom, to: formTo });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRangeFilter, watchable]);

  return (
    <Group justify="space-between" mb="md" align="flex-end">
      <DatePickerInput
        {...rangeFilterField.getInputProps()}
        label="Zeitraum"
        w={rem(300)}
        // mb="sm"
        type="range"
        valueFormat="DD MMMM YYYY"
        popoverProps={{
          zIndex: 900,
        }}
      />
      <Group>
        <Button
          size="sm"
          variant="default"
          onClick={toggleMapOpen}
          rightSection={<IconMap2 />}
        >
          Karte
        </Button>
        <Button
          size="sm"
          variant="default"
          disabled={!isMapOpen}
          onClick={() =>
            setOrientation((old) =>
              old === "horizontal" ? "vertical" : "horizontal",
            )
          }
          rightSection={
            orientation === "horizontal" ? (
              <IconRectangle />
            ) : (
              <IconRectangleVertical />
            )
          }
        >
          {orientation === "horizontal" ? "Horizontal" : "Vertikal"}
        </Button>
      </Group>
    </Group>
  );
};
