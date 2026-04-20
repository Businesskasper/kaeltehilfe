import { Button, Group, MultiSelect, rem, SegmentedControl } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import React from "react";
import { Bus, GoodType, GoodTypeTranslation, GoodTypes } from "../../../common/data";
import { ReportFilters, getDatePreset } from "./reportUtils";

type Props = {
  filters: ReportFilters;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>;
  busses: Bus[];
};

const presets = [
  { value: "7d", label: "7 Tage" },
  { value: "30d", label: "30 Tage" },
  { value: "season", label: "Saison" },
  { value: "custom", label: "Benutzerdefiniert" },
] as const;

type Preset = (typeof presets)[number]["value"];

export const ReportsFilterBar = ({ filters, setFilters, busses }: Props) => {
  const [activePreset, setActivePreset] = React.useState<Preset>("30d");

  const applyPreset = React.useCallback(
    (preset: Preset) => {
      setActivePreset(preset);
      if (preset !== "custom") {
        const { from, to } = getDatePreset(preset as "7d" | "30d" | "season");
        setFilters((f) => ({ ...f, from, to }));
      }
    },
    [setFilters],
  );

  const busOptions = busses.map((b) => ({
    value: String(b.id),
    label: b.registrationNumber,
  }));

  const goodTypeOptions = GoodTypes.map((t) => ({
    value: t,
    label: GoodTypeTranslation[t].label,
  }));

  return (
    <Group mb="lg" wrap="wrap" gap="md" align="flex-end">
      <SegmentedControl
        value={activePreset}
        onChange={(v) => applyPreset(v as Preset)}
        data={presets.map((p) => ({ value: p.value, label: p.label }))}
        size="sm"
      />
      <DatePickerInput
        type="range"
        label="Zeitraum"
        leftSection={<IconCalendar size={16} />}
        value={[filters.from, filters.to]}
        onChange={([from, to]) => {
          if (from && to) {
            setActivePreset("custom");
            setFilters((f) => ({ ...f, from, to }));
          }
        }}
        valueFormat="DD.MM.YYYY"
        w={rem(260)}
        size="sm"
        popoverProps={{ zIndex: 900 }}
      />
      <MultiSelect
        label="Schichtträger"
        placeholder="Alle"
        data={busOptions}
        value={filters.busIds.map(String)}
        onChange={(vals) => setFilters((f) => ({ ...f, busIds: vals.map(Number) }))}
        w={rem(200)}
        size="sm"
        clearable
      />
      <MultiSelect
        label="Gütertyp"
        placeholder="Alle"
        data={goodTypeOptions}
        value={filters.goodTypes}
        onChange={(vals) => setFilters((f) => ({ ...f, goodTypes: vals as GoodType[] }))}
        w={rem(200)}
        size="sm"
        clearable
      />
      <Button
        size="sm"
        variant="subtle"
        onClick={() => {
          setFilters((f) => ({ ...f, busIds: [], goodTypes: [] }));
          applyPreset("30d");
        }}
      >
        Zurücksetzen
      </Button>
    </Group>
  );
};
