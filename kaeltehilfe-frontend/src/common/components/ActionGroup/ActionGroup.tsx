import {
  ActionIcon,
  ActionIconProps,
  ButtonGroup,
  ButtonGroupProps,
  rem,
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
  groupProps?: ButtonGroupProps;
};

export const ActionGroup = ({
  options,
  onClick,
  groupProps,
}: ActionGroupProps) => {
  const getFirstActionRadius = () => {
    return groupProps?.orientation === "vertical"
      ? `${rem(4)} ${rem(4)} 0 0`
      : `${rem(4)} 0 0 ${rem(4)}`;
  };
  const getLastActionRadius = () => {
    return groupProps?.orientation === "vertical"
      ? `0 0 ${rem(4)} ${rem(4)}`
      : `0 ${rem(4)} ${rem(4)} 0`;
  };
  return (
    <ButtonGroup p={0} {...groupProps}>
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
            w={rem(40)}
            variant="default"
            radius={radius}
            key={option.id}
            {...option.props}
          >
            <option.icon />
          </ActionIcon>
        );
      })}
    </ButtonGroup>
  );
};
