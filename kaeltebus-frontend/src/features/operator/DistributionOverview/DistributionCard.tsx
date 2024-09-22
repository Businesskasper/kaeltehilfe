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
import {
  Distribution,
  GoodTypeTranslation,
  useGoods,
} from "../../../common/app";
import { compareByDateOnly, groupBy } from "../../../common/utils";

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

  // TODO: Gruppierung um ort
  const byGood = groupBy(distributions, (d) => d.good?.id);
  const sortedGoodIds = Array.from(byGood.keys()).sort((goodId1, goodId2) => {
    const dists1 = byGood.get(goodId1) || [];
    const dists2 = byGood.get(goodId2) || [];

    return compareByDateOnly(dists1[0]?.timestamp, dists2[0]?.timestamp);
  });

  const increaseDistribution = () => {};

  const decreaseDistribution = () => {};

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
                      onClick={() => decreaseDistribution()}
                    >
                      <IconMinus />
                    </ActionIcon>
                  )}
                  <Text>{quanitity}</Text>
                  {isToday && (
                    <ActionIcon
                      variant="transparent"
                      onClick={() => increaseDistribution()}
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
