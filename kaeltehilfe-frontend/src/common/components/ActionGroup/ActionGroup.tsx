import {
  ActionIcon,
  ActionIconProps,
  ButtonGroup,
  ButtonGroupProps,
} from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { ComponentType } from "react";

export type ActionGroupOption = {
  icon: ComponentType<IconProps>;
  id: string;
  hoverTitle?: string;
  props?: ActionIconProps;
};

export type ActionGroupProps = {
  options: Array<ActionGroupOption>;
  onClick: (selectedId: string) => void;
  // groupProps?: GroupProps;
  groupProps?: ButtonGroupProps;
};

export const ActionGroup = ({
  options,
  onClick,
  groupProps,
}: ActionGroupProps) => {
  const getFirstActionRadius = () => {
    return groupProps?.orientation === "vertical"
      ? "4px 4px 0 0"
      : "4px 0 0 4px";
  };
  const getLastActionRadius = () => {
    return groupProps?.orientation === "vertical"
      ? "0 0 4px 4px"
      : "0 4px 4px 0";
  };
  return (
    <ButtonGroup p={0} {...groupProps}>
      {/* <Group p={0} gap={0} {...groupProps}> */}

      {options.map((option, index) => {
        const radius =
          index === 0
            ? getFirstActionRadius()
            : index === options.length - 1
            ? getLastActionRadius()
            : "0";
        return (
          <ActionIcon
            title={option.hoverTitle}
            onClick={() => onClick(option.id)}
            onDrag={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            w="40px"
            variant="default"
            radius={radius}
            key={option.id}
            {...option.props}
          >
            <option.icon />
          </ActionIcon>
        );
      })}
      {/* </Group> */}
    </ButtonGroup>
  );
};
