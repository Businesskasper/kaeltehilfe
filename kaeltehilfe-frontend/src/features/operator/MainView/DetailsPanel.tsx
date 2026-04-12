import { Divider, Grid, Group, Tabs, Title } from "@mantine/core";
import { IconMap2, IconMessage, IconToolsKitchen2 } from "@tabler/icons-react";
import React from "react";
import { Comment, Distribution, GeoLocation } from "../../../common/data";
import {
  compareByDateOnly,
  compareByDateTime,
  groupBy,
  useBrowserStorage,
} from "../../../common/utils";
import { CommentCard } from "../Comments/CommentCard";
import { DistributionCard } from "../shared/DistributionCard";

type DetailsPanelProps = {
  distributions?: Array<Distribution>;
  comments?: Array<Comment>;
  selectedDate: Date;
  today: Date;
  onCardClick?: (name: string, distributions: Array<Distribution>) => void;
  onCommentCardClick?: (geoLocation: GeoLocation) => void;
};

export const DetailsPanel = ({
  distributions,
  comments,
  selectedDate,
  today,
  onCardClick,
  onCommentCardClick,
}: DetailsPanelProps) => {
  const distributionsToDisplay = (distributions || []).filter(
    (d) => compareByDateOnly(d.timestamp, selectedDate) === 0,
  );

  const commentsToDisplay = comments || [];

  const byLocationName = groupBy(
    distributionsToDisplay,
    (d) => d.locationName || 0,
  );

  const sortedLocationIds = Array.from(byLocationName.keys()).sort(
    (location1, location2) => {
      const firstDistL1 = byLocationName
        .get(location1)
        ?.sort((d1, d2) => compareByDateTime(d1.timestamp, d2.timestamp))?.[0];
      const firstDistL2 = byLocationName
        .get(location2)
        ?.sort((d1, d2) => compareByDateTime(d1.timestamp, d2.timestamp))?.[0];
      return compareByDateTime(firstDistL2?.timestamp, firstDistL1?.timestamp);
    },
  );

  const sortedComments = [...commentsToDisplay].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return compareByDateTime(b.addOn, a.addOn);
  });

  const [activeTab, setActiveTab] = useBrowserStorage<string>(
    "SESSION",
    "OPERATOR_DETAILS_ACTIVE_TAB",
    "distributions",
  );

  return (
    <Tabs value={activeTab} onChange={(v) => setActiveTab(v ?? "distributions")} h="100%" style={{ display: "flex", flexDirection: "column" }}>
      <Tabs.List px="xs" mb="md">
        <Tabs.Tab value="distributions" leftSection={<IconToolsKitchen2 size={14} />}>
          Ausgaben
        </Tabs.Tab>
        <Tabs.Tab value="comments" leftSection={<IconMessage size={14} />}>
          Kommentare
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="distributions" style={{ flex: 1, overflowY: "auto" }}>
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
            const locationDistributions = byLocationName.get(locationId) || [];
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
              locationDistributions?.[0]?.locationName || "Unbekannter Ort";

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
      </Tabs.Panel>

      <Tabs.Panel value="comments" style={{ flex: 1, overflowY: "auto" }} p="xs">
        {sortedComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onClick={onCommentCardClick}
          />
        ))}
      </Tabs.Panel>
    </Tabs>
  );
};
