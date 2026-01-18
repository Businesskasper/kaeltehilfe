import {
  Box,
  PasswordInput,
  PasswordInputProps,
  Popover,
  Progress,
  Text,
  rem,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

type PasswordRequirement = {
  matcher: RegExp;
  error: string;
};
export type NewPasswordProps = PasswordInputProps & {
  requirements: Array<PasswordRequirement>;
};
export const NewPassword = ({
  requirements,
  ...fieldParams
}: NewPasswordProps) => {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const value = fieldParams.value?.toString() || "";

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.error}
      meets={requirement.matcher.test(value)}
    />
  ));

  const strength = getStrength(requirements, value);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      width="target"
      transitionProps={{ transition: "pop" }}
    >
      <Popover.Target>
        <div
          onFocusCapture={() => setPopoverOpened(true)}
          onBlurCapture={() => setPopoverOpened(false)}
        >
          <PasswordInput {...fieldParams} />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Progress color={color} value={strength} size={5} mb="xs" />
        {fieldParams.minLength && (
          <PasswordRequirement
            label={`Enthält mindestens ${fieldParams.minLength} Zeichen`}
            meets={!!value && value.length > fieldParams.minLength}
          />
        )}
        {checks}
      </Popover.Dropdown>
    </Popover>
  );
};

type PasswordRequirementProps = { meets: boolean; label: string };
const PasswordRequirement = ({ meets, label }: PasswordRequirementProps) => {
  return (
    <Text
      c={meets ? "teal" : "red"}
      style={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? (
        <IconCheck style={{ width: rem(14), height: rem(14) }} />
      ) : (
        <IconX style={{ width: rem(14), height: rem(14) }} />
      )}{" "}
      <Box ml={10}>{label}</Box>
    </Text>
  );
};

const getStrength = (
  requirements: Array<PasswordRequirement>,
  password: string,
) => {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.matcher.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
};
