import {
  ActionIcon,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconExclamationMark,
  IconMinus,
  IconPlaceholder,
  IconPlus,
} from "@tabler/icons-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Distribution,
  GoodTypeTranslation,
  useGoods,
  useWriteDistributions,
} from "../../../common/data";
import {
  compareByDateOnly,
  compareByDateTime,
  groupBy,
} from "../../../common/utils";

export type DistributionCardProps = {
  clientId: number;
  clientName: string;
  distributions: Array<Distribution>;
  isToday: boolean;
  onClick?: () => void;
};

export const DistributionCard = ({
  clientId,
  clientName,
  distributions,
  isToday,
  onClick,
}: DistributionCardProps) => {
  const navigate = useNavigate();

  const {
    objs: { data: goods },
  } = useGoods();

  const [distIdsInEdit, setDistIdsInEdit] = React.useState<Array<number>>([]);
  const {
    update: { mutate: updateDistribution },
    remove: { mutate: removeDistribution },
  } = useWriteDistributions();

  // TODO: Gruppierung um Ort?
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
        },
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
      },
    );
  };

  const newDistribution = () => {
    if (!isToday) {
      notifications.show({
        color: "yellow",
        icon: <IconExclamationMark />,
        withBorder: false,
        withCloseButton: true,
        mb: "xs",
        message: "Zum Hinzufügen bitte zum aktuellen Tag wechseln",
      });
      return;
    }
    const distWithGeoLocation = distributions.find((d) => !!d.geoLocation);

    navigate("/add", {
      state: {
        clientId,
        lat: distWithGeoLocation?.geoLocation?.lat,
        lng: distWithGeoLocation?.geoLocation?.lng,
      },
    });
  };

  return (
    <Card padding="md" radius="md" withBorder h={300}>
      <Card.Section
        // onClick={() => newDistribution()}
        withBorder
        inheritPadding
        py="xs"
        // style={{ cursor: "pointer" }}
      >
        <Group wrap="nowrap" justify="space-between">
          <Title
            onClick={onClick}
            style={{ textOverflow: "ellipsis", overflow: "hidden" }}
            order={4}
          >
            {clientName}
          </Title>
          <ActionIcon
            disabled={!isToday}
            onClick={() => newDistribution()}
            variant="transparent"
          >
            <IconPlus />
          </ActionIcon>
        </Group>
      </Card.Section>
      <ScrollArea>
        <Stack py="xs">
          {sortedGoodIds?.map((goodId) => {
            const goodDistributions =
              distributions?.filter((d) => d.good?.id === goodId) || [];
            const goodName = goodDistributions[0]?.good?.name || "";
            const quanitity = goodDistributions.reduce(
              (sum, dist) => sum + dist.quantity || 0,
              0,
            );
            const good = goods?.find((g) => g.id === goodId);
            const Icon = good?.goodType
              ? GoodTypeTranslation[good.goodType]?.icon
              : undefined;

            const latestDistribution = goodDistributions.sort((a, b) =>
              compareByDateTime(a.timestamp, b.timestamp),
            )[0];

            return (
              <Group key={String(goodId)} justify="space-between">
                <Group>
                  {Icon ? <Icon /> : <IconPlaceholder visibility="hidden" />}
                  <Text>{goodName}</Text>
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
