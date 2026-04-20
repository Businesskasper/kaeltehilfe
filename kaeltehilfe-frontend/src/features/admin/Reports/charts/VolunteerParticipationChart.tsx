import { Center, Checkbox, Stack, Text } from "@mantine/core";
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
import { Shift, Volunteer } from "../../../../common/data";
import { buildVolunteerParticipation } from "../reportUtils";

type Props = { shifts: Shift[]; volunteers: Volunteer[] };

export const VolunteerParticipationChart = ({ shifts, volunteers }: Props) => {
  const [onlyInactive, setOnlyInactive] = React.useState(false);

  const data = React.useMemo(
    () => buildVolunteerParticipation(shifts, volunteers, onlyInactive),
    [shifts, volunteers, onlyInactive],
  );

  return (
    <Stack gap="xs">
      <Checkbox
        size="xs"
        label="Nur inaktive Freiwillige anzeigen"
        checked={onlyInactive}
        onChange={(e) => setOnlyInactive(e.currentTarget.checked)}
      />
      {data.length === 0 ? (
        <Center h={200}>
          <Text c="dimmed" size="sm">Keine Freiwilligen gefunden</Text>
        </Center>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 28)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 24, bottom: 4, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={95} />
            <Tooltip />
            <Bar dataKey="shifts" name="Schichten" radius={[0, 3, 3, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.shifts === 0 ? "#868e96" : "#339af0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Stack>
  );
};
