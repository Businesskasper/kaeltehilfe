import { Center, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Distribution } from "../../../../common/data";
import { formatDate } from "../../../../common/utils";
import { buildDistributionsOverTime, getUniqueBusLabels, TimeSeriesPoint } from "../reportUtils";

const BUS_COLORS = ["#339af0", "#f06595", "#a9e34b", "#ff922b", "#cc5de8", "#20c997"];

type Props = { distributions: Distribution[] };

export const DistributionsOverTimeChart = ({ distributions }: Props) => {
  const [granularity, setGranularity] = React.useState<"daily" | "weekly">("daily");
  const [metric, setMetric] = React.useState<"count" | "quantity">("count");

  const data: TimeSeriesPoint[] = React.useMemo(
    () => buildDistributionsOverTime(distributions, granularity, metric),
    [distributions, granularity, metric],
  );

  const busLabels = React.useMemo(() => getUniqueBusLabels(distributions), [distributions]);

  if (data.length === 0) {
    return (
      <Center h={200}>
        <Text c="dimmed" size="sm">Keine Daten im gewählten Zeitraum</Text>
      </Center>
    );
  }

  return (
    <Stack gap="xs">
      <Group gap="xs">
        <SegmentedControl
          size="xs"
          value={granularity}
          onChange={(v) => setGranularity(v as "daily" | "weekly")}
          data={[{ value: "daily", label: "Täglich" }, { value: "weekly", label: "Wöchentlich" }]}
        />
        <SegmentedControl
          size="xs"
          value={metric}
          onChange={(v) => setMetric(v as "count" | "quantity")}
          data={[{ value: "count", label: "Anzahl" }, { value: "quantity", label: "Menge" }]}
        />
      </Group>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => formatDate(v)} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip labelFormatter={(v) => formatDate(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {busLabels.map((label, i) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={BUS_COLORS[i % BUS_COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Stack>
  );
};
