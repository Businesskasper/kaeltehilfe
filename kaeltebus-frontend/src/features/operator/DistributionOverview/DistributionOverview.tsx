import {
  Card,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  SimpleGrid,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDistributionsPaginated } from "../../../common/app";
import {
  compareByDateOnly,
  formatDate,
  groupBy,
  toNormalizedDate,
} from "../../../common/utils";
import { DistributionCard } from "./DistributionCard";

import "./DistributionOverview.scss";

export const DistributionOverview = () => {
  // const {
  //   objs: { data: distributions, isLoading },
  // } = useDistributions();

  const {
    queryDistributionsPaginated: {
      data,
      fetchNextPage,
      isLoading,
      hasNextPage,
      isFetchingNextPage,
    },
  } = useDistributionsPaginated();
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  // IntersectionObserver callback to trigger fetching the next page
  const handleObserver = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  React.useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null, // Use the browser viewport as the container
      rootMargin: "0px",
      threshold: 0.1, // Trigger when 10% of the target is visible
    });

    const currentObserver = observerRef.current;
    const target = loadMoreRef.current;

    if (target) currentObserver.observe(target);

    return () => {
      if (currentObserver && target) {
        currentObserver.unobserve(target);
      }
    };
  }, [handleObserver]);

  const distributions = data?.pages?.flatMap((p) => p);

  const navigate = useNavigate();

  const { colorScheme } = useMantineColorScheme();

  const byDate = React.useMemo(() => {
    const byDateMap = groupBy(distributions || [], (d) =>
      toNormalizedDate(d.timestamp)?.valueOf()
    );
    const today = toNormalizedDate(new Date());
    if (!byDateMap.has(today?.valueOf())) {
      byDateMap.set(today?.valueOf(), []);
    }
    return byDateMap;
  }, [distributions]);

  const sortedByDate = React.useMemo(
    () => Array.from(byDate.keys()).sort((a, b) => compareByDateOnly(b, a)),
    [byDate]
  );

  const plusHovered = useHover();

  const isToday = (date: Date | number) =>
    compareByDateOnly(new Date(date.valueOf()), new Date()) === 0;

  return (
    <div className="DistributionOverview">
      {isLoading && <LoadingOverlay visible />}
      {sortedByDate.map((distributionDate) => {
        const byClientId = groupBy(
          byDate.get(distributionDate) || [],
          (d) => d.client.id
        );

        return (
          <div key={String(distributionDate)}>
            <Title mb="xs" order={4}>
              {formatDate(distributionDate)}
            </Title>
            <Divider mb="lg" />
            <SimpleGrid
              mb="xl"
              cols={{ base: 1, xs: 2, sm: 3, md: 3, lg: 4, xl: 5 }}
            >
              {distributionDate && isToday(distributionDate) && (
                <Card
                  ref={plusHovered.ref}
                  style={{ cursor: "pointer" }}
                  bg={colorScheme === "light" ? "light_blue" : "gray"}
                  shadow={
                    !plusHovered.hovered
                      ? undefined
                      : colorScheme === "dark"
                      ? "xl"
                      : "sm"
                  }
                  padding="md"
                  radius="md"
                  withBorder
                  h={300}
                  onClick={() => navigate("/operator/addDistribution")}
                >
                  <Group h="100%" justify="center" align="center">
                    <IconPlus />
                  </Group>
                </Card>
              )}
              {Array.from(byClientId.keys()).map((clientId) => {
                const distributions =
                  byDate
                    .get(distributionDate)
                    ?.filter((d) => d.client.id === clientId) || [];
                return (
                  <DistributionCard
                    key={String(clientId)}
                    clientName={distributions?.[0]?.client?.name || ""}
                    distributions={distributions || []}
                    isToday={!!distributionDate && isToday(distributionDate)}
                  />
                );
              })}
            </SimpleGrid>
          </div>
        );
      })}
      <Group justify="center" w="100%" ref={loadMoreRef}>
        {isFetchingNextPage ? (
          <Loader size="sm" />
        ) : (
          <Text>Scrollen um weitere Ergebnisse zu laden</Text>
        )}
      </Group>
    </div>
  );
};
