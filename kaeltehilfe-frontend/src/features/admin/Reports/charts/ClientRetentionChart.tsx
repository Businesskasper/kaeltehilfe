import { Center, Text } from "@mantine/core";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Distribution } from "../../../../common/data";
import { formatDate } from "../../../../common/utils";
import { buildClientRetention } from "../reportUtils";

type Props = { distributions: Distribution[] };

export const ClientRetentionChart = ({ distributions }: Props) => {
  const data = React.useMemo(() => buildClientRetention(distributions), [distributions]);

  if (data.length === 0) {
    return (
      <Center h={200}>
        <Text c="dimmed" size="sm">Keine Daten im gewählten Zeitraum</Text>
      </Center>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(v) => formatDate(v)} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip labelFormatter={(v) => formatDate(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="new" name="Neu" stackId="a" fill="#a9e34b" radius={[0, 0, 0, 0]} />
        <Bar dataKey="returning" name="Wiederkehrend" stackId="a" fill="#339af0" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
