import { Chip, Group, Text } from "@mantine/core";
import { Good, GoodTypeTranslation } from "../../../common/data";

import "./DistributionAdd.scss";

type GoodListItemProps = React.PropsWithChildren & {
  good: Good;
  onTagClicked?: (text: string) => void;
};

export const GoodListItem = ({
  good,
  onTagClicked,
  children,
}: GoodListItemProps) => {
  const Icon = good.goodType
    ? GoodTypeTranslation[good.goodType]?.icon
    : undefined;

  return (
    <div className="good-list-item">
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
                  style={{ pointerEvents: !onTagClicked ? "none" : undefined }}
                  size="xs"
                  checked={false}
                  key={index}
                  onClick={!onTagClicked ? undefined : () => onTagClicked(tag)}
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
