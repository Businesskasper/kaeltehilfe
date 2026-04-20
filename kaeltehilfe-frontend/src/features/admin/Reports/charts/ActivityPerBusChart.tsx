import { Center, SegmentedControl, Stack, Text } from "@mantine/core";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Distribution } from "../../../../common/data";
import { buildActivityPerBus } from "../reportUtils";

const BUS_COLORS = ["#339af0", "#f06595", "#a9e34b", "#ff922b", "#cc5de8", "#20c997"];

type Props = { distributions: Distribution[] };

export const ActivityPerBusChart = ({ distributions }: Props) => {
  const [metric, setMetric] = React.useState<"distributions" | "quantity">("distributions");

  const data = React.useMemo(() => buildActivityPerBus(distributions), [distributions]);

  if (data.length === 0) {
    return (
      <Center h={200}>
        <Text c="dimmed" size="sm">Keine Daten im gewählten Zeitraum</Text>
      </Center>
    );
  }

  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        value={metric}
        onChange={(v) => setMetric(v as "distributions" | "quantity")}
        data={[{ value: "distributions", label: "Anzahl Ausgaben" }, { value: "quantity", label: "Gesamtmenge" }]}
        w="fit-content"
      />
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
          <XAxis dataKey="bus" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey={metric} radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BUS_COLORS[i % BUS_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
};
