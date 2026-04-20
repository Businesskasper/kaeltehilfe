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
import { Distribution, Good, GoodType, GoodTypeTranslation } from "../../../../common/data";
import { buildGoodsBreakdown } from "../reportUtils";

const TYPE_COLORS: Record<GoodType, string> = {
  FOOD: "#ff922b",
  CLOTHING: "#339af0",
  CONSUMABLE: "#cc5de8",
  HYGIENE: "#20c997",
  BEDDING: "#f06595",
  EQUIPMENT: "#a9e34b",
};

type Props = { distributions: Distribution[]; goods: Good[] };

export const GoodsBreakdownChart = ({ distributions, goods }: Props) => {
  const [groupBy, setGroupBy] = React.useState<"item" | "type">("item");

  const data = React.useMemo(
    () => buildGoodsBreakdown(distributions, goods, groupBy),
    [distributions, goods, groupBy],
  );

  if (data.length === 0) {
    return (
      <Center h={200}>
        <Text c="dimmed" size="sm">Keine Daten im gewählten Zeitraum</Text>
      </Center>
    );
  }

  const label = (goodType: GoodType) =>
    groupBy === "type" ? GoodTypeTranslation[goodType]?.label ?? goodType : undefined;

  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        value={groupBy}
        onChange={(v) => setGroupBy(v as "item" | "type")}
        data={[{ value: "item", label: "Nach Gut" }, { value: "type", label: "Nach Typ" }]}
        w="fit-content"
      />
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 60, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-40}
            textAnchor="end"
            tickFormatter={(v, i) => label(data[i]?.goodType) ?? v}
          />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, "Menge"]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload;
              if (!item) return "";
              return groupBy === "type"
                ? GoodTypeTranslation[item.goodType as GoodType]?.label ?? item.name
                : item.name;
            }}
          />
          <Bar dataKey="quantity" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={TYPE_COLORS[entry.goodType] ?? "#339af0"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
};
