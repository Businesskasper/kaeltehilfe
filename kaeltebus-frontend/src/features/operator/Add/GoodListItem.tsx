import { Chip, Group, Text } from "@mantine/core";
import { Good, GoodTypeTranslation } from "../../../common/app";

import "./DistributionAdd.scss";

type GoodListItemProps = React.PropsWithChildren & {
  good: Good;
};

export const GoodListItem = ({ good, children }: GoodListItemProps) => {
  const Icon = good.goodType
    ? GoodTypeTranslation[good.goodType]?.icon
    : undefined;

  return (
    <div className="GoodListItem">
      <Group w="100%" justify="space-between">
        <Group>
          <Group gap="xs" align="center">
            <Text>{good.name}</Text>
            {Icon && <Icon />}
          </Group>
          <Group gap="xs" ml="md">
            {good.tags.map((tag, index) => {
              return (
                <Chip
                  style={{ pointerEvents: "none" }}
                  size="xs"
                  checked={false}
                  key={index}
                >
                  {tag}
                </Chip>
              );
            })}
          </Group>
        </Group>
        {children}
      </Group>
    </div>
  );
};
