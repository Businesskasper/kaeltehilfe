import { Divider, Grid, Group, Title } from "@mantine/core";
import { IconMap2 } from "@tabler/icons-react";
import React from "react";
import { Distribution } from "../../../common/data";
import {
  compareByDateOnly,
  compareByDateTime,
  groupBy,
} from "../../../common/utils";
import { DistributionCard } from "../shared/DistributionCard";

type DetailsPanelProps = {
  distributions?: Array<Distribution>;
  selectedDate: Date;
  today: Date;
  onCardClick?: (name: string, distributions: Array<Distribution>) => void;
};

export const DetailsPanel = ({
  distributions,
  selectedDate,
  today,
  onCardClick,
}: DetailsPanelProps) => {
  const distributionsToDisplay = (distributions || []).filter(
    (d) => compareByDateOnly(d.timestamp, selectedDate) === 0,
  );

  const byLocationId = groupBy(
    distributionsToDisplay,
    (d) => d.location?.id || 0,
  );

  const sortedLocationIds = Array.from(byLocationId.keys()).sort(
    (location1, location2) => {
      const firstDistL1 = byLocationId
        .get(location1)
        ?.sort((d1, d2) => compareByDateTime(d1.timestamp, d2.timestamp))?.[0];
      const firstDistL2 = byLocationId
        .get(location2)
        ?.sort((d1, d2) => compareByDateTime(d1.timestamp, d2.timestamp))?.[0];
      return compareByDateTime(firstDistL2?.timestamp, firstDistL1?.timestamp);
    },
  );

  return (
    <Grid
      mx="xs"
      columns={12}
      breakpoints={{
        xs: "300px",
        sm: "500px",
        md: "900px",
        lg: "1200px",
        xl: "1400px",
      }}
      type="container"
    >
      {sortedLocationIds?.map((locationId) => {
        const locationDistributions = byLocationId.get(locationId) || [];
        const byClientId = groupBy(locationDistributions, (d) => d.client.id);
        const clientIds = Array.from(byClientId.keys()).sort(
          (clientId1, clientId2) => {
            const oldestDistribution1 = byClientId
              .get(clientId1)
              ?.sort((dist1, dist2) =>
                compareByDateTime(dist1.timestamp, dist2.timestamp),
              )[0];
            const oldestDistribution2 = byClientId
              .get(clientId2)
              ?.sort((dist1, dist2) =>
                compareByDateTime(dist1.timestamp, dist2.timestamp),
              )[0];
            return compareByDateTime(
              oldestDistribution2?.timestamp,
              oldestDistribution1?.timestamp,
            );
          },
        );
        const locationName =
          locationDistributions?.[0]?.location?.name || "Unbekannter Ort";

        return (
          <React.Fragment key={locationId}>
            <Grid.Col mb="xs" span={12} key={locationId}>
              <Group mb="xs">
                <IconMap2 />
                <Title order={4}>{locationName}</Title>
              </Group>
              <Divider />
            </Grid.Col>
            {clientIds.map((clientId) => {
              const distributions = byClientId.get(clientId) || [];
              return (
                <Grid.Col
                  mb="lg"
                  span={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                  key={clientId}
                >
                  <DistributionCard
                    key={locationId}
                    clientId={distributions?.[0]?.client?.id}
                    clientName={distributions?.[0]?.client?.name}
                    distributions={distributions || []}
                    onClick={() => {
                      onCardClick?.(locationName, distributions);
                    }}
                    isToday={
                      !!selectedDate &&
                      compareByDateOnly(selectedDate, today) === 0
                    }
                  />
                </Grid.Col>
              );
            })}
          </React.Fragment>
        );
      })}
    </Grid>
  );
};
