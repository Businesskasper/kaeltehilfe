import {
  ActionIcon,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import React from "react";
import {
  Distribution,
  GoodTypeTranslation,
  useDistributions,
  useGoods,
} from "../../../common/app";
import {
  compareByDateOnly,
  compareByDateTime,
  groupBy,
} from "../../../common/utils";

export type DistributionCardProps = {
  clientName: string;
  distributions: Array<Distribution>;
  isToday: boolean;
};

export const DistributionCard = ({
  clientName,
  distributions,
  isToday,
}: DistributionCardProps) => {
  const {
    objs: { data: goods },
  } = useGoods();

  const [distIdsInEdit, setDistIdsInEdit] = React.useState<Array<number>>([]);
  const {
    update: { mutate: updateDistribution },
    remove: { mutate: removeDistribution },
  } = useDistributions();

  // TODO: Gruppierung um Ort?
  // TODO: Sortierung innerhalb der Gruppe?
  const byGood = groupBy(distributions, (d) => d.good?.id);
  const sortedGoodIds = Array.from(byGood.keys()).sort((goodId1, goodId2) => {
    const dists1 = byGood.get(goodId1) || [];
    const dists2 = byGood.get(goodId2) || [];

    return compareByDateOnly(dists1[0]?.timestamp, dists2[0]?.timestamp);
  });

  const decreaseDistribution = (latestDistribution: Distribution) => {
    setDistIdsInEdit((inEdit) => {
      const copy = inEdit.filter((id) => id !== latestDistribution.id);
      return [...copy, latestDistribution.id];
    });

    if (latestDistribution.quantity > 1) {
      // Update distribution
      updateDistribution(
        {
          id: latestDistribution.id,
          update: {
            quantity: latestDistribution.quantity - 1,
          },
        },
        {
          onSettled: () => {
            setDistIdsInEdit((inEdit) => {
              const copy = inEdit.filter((id) => id !== latestDistribution.id);
              return copy;
            });
          },
        }
      );
    } else {
      // Delete distribution
      removeDistribution(latestDistribution.id, {
        onSettled: () => {
          setDistIdsInEdit((inEdit) => {
            const copy = inEdit.filter((id) => id !== latestDistribution.id);
            return copy;
          });
        },
      });
    }
  };

  const increaseDistribution = (latestDistribution: Distribution) => {
    setDistIdsInEdit((inEdit) => {
      const copy = inEdit.filter((id) => id !== latestDistribution.id);
      return [...copy, latestDistribution.id];
    });

    updateDistribution(
      {
        id: latestDistribution.id,
        update: { quantity: latestDistribution.quantity + 1 },
      },
      {
        onSettled: () => {
          setDistIdsInEdit((inEdit) => {
            const copy = inEdit.filter((id) => id !== latestDistribution.id);
            return copy;
          });
        },
      }
    );
  };

  return (
    <Card padding="md" radius="md" withBorder h={300}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={4}>{clientName}</Title>
        </Group>
      </Card.Section>
      <ScrollArea>
        <Stack py="xs" className="DistributionCardItemsContainer">
          {sortedGoodIds?.map((goodId) => {
            const goodDistributions =
              distributions?.filter((d) => d.good?.id === goodId) || [];
            const goodName = goodDistributions[0]?.good?.name || "";
            const quanitity = goodDistributions.reduce(
              (sum, dist) => sum + dist.quantity || 0,
              0
            );
            const good = goods?.find((g) => g.id === goodId);
            const Icon = good?.goodType
              ? GoodTypeTranslation[good.goodType]?.icon
              : undefined;

            const latestDistribution = distributions.sort((a, b) =>
              compareByDateTime(a.timestamp, b.timestamp)
            )[0];

            return (
              <Group key={String(goodId)} justify="space-between">
                <Group>
                  <Text>{goodName}</Text>
                  {Icon && <Icon />}
                </Group>
                <Group>
                  {isToday && (
                    <ActionIcon
                      variant="transparent"
                      color="red"
                      disabled={distIdsInEdit.includes(latestDistribution.id)}
                      onClick={() => decreaseDistribution(latestDistribution)}
                    >
                      <IconMinus />
                    </ActionIcon>
                  )}
                  <Text>{quanitity}</Text>
                  {isToday && (
                    <ActionIcon
                      variant="transparent"
                      disabled={distIdsInEdit.includes(latestDistribution.id)}
                      onClick={() => increaseDistribution(latestDistribution)}
                    >
                      <IconPlus />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
            );
          })}
        </Stack>
      </ScrollArea>
    </Card>
  );
};
