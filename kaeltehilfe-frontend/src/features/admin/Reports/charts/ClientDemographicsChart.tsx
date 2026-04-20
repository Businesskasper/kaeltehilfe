import { Center, SimpleGrid, Text } from "@mantine/core";
import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Client, Distribution } from "../../../../common/data";
import { buildAgeDemographics, buildGenderDemographics } from "../reportUtils";

type Props = { distributions: Distribution[]; clients: Client[] };

export const ClientDemographicsChart = ({ distributions, clients }: Props) => {
  const servedClientIds = React.useMemo(
    () => new Set(distributions.map((d) => d.client.id)),
    [distributions],
  );

  const genderData = React.useMemo(
    () => buildGenderDemographics(servedClientIds, clients),
    [servedClientIds, clients],
  );

  const ageData = React.useMemo(
    () => buildAgeDemographics(servedClientIds, clients),
    [servedClientIds, clients],
  );

  if (servedClientIds.size === 0) {
    return (
      <Center h={200}>
        <Text c="dimmed" size="sm">Keine Daten im gewählten Zeitraum</Text>
      </Center>
    );
  }

  return (
    <SimpleGrid cols={2} spacing="xs">
      <div>
        <Text size="xs" c="dimmed" ta="center" mb={4}>Geschlecht</Text>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
              {genderData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <Text size="xs" c="dimmed" ta="center" mb={4}>Alter (ungefähr)</Text>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={ageData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
              {ageData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SimpleGrid>
  );
};
