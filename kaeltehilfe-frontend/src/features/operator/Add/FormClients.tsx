import {
  ActionIcon,
  Fieldset,
  Group,
  InputError,
  InputLabel,
  NumberInput,
  SegmentedControl,
} from "@mantine/core";
import {} from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { FormSelect } from "../../../common/components";
import { Client, GenderOptions, useClients } from "../../../common/data";
import { rem } from "../../../common/utils";
import { useDistributionFormContext } from "./DistributionFormContext";

export const FormClients = () => {
  const {
    objs: { data: clients },
  } = useClients();

  const form = useDistributionFormContext();

  const setClientData = (index: number, clientData?: Client) => {
    form.setFieldValue(`clients.${index}.id`, clientData?.id);
    form.setFieldValue(`clients.${index}.gender`, clientData?.gender || null, {
      forceUpdate: true,
    });
    form.setFieldValue(
      `clients.${index}.approxAge`,
      clientData?.approxAge || "",
      { forceUpdate: true },
    );
  };

  const clientFields = form.getValues().clients?.map((_, index) => (
    <Fieldset
      w="100%"
      variant="filled"
      mt={index > 0 ? "md" : undefined}
      mb="md"
      key={index}
    >
      <Group align="baseline" pos="relative" w="100%">
        <FormSelect
          searchable
          items={clients || []}
          valueGetter="name"
          withAsterisk
          sort
          label="Name"
          style={{ width: `calc(100% - ${rem(45)})` }}
          formProps={form.getInputProps(`clients.${index}.name`)}
          onItemSelected={(selectedClient) => {
            setClientData(index, selectedClient);
          }}
          onBlur={() => {
            // In case on option was selected (but typed), we must manually set the volunteers id
            const currentClient = form.getValues()?.clients[index];
            const existingClient = clients?.find((v) => v.id);
            if (
              currentClient.id &&
              existingClient?.name === currentClient.name &&
              existingClient?.id === currentClient.id
            ) {
              return;
            }

            if (!currentClient || !currentClient.name) {
              setClientData(index, undefined);
              return;
            }
            const clientObj = clients?.filter(
              (v) => v.name === currentClient.name,
            );
            if (!clientObj || clientObj.length === 0) {
              setClientData(index, undefined);
              return;
            }
            if (clientObj.length > 1) {
              return;
            }
            setClientData(index, clientObj[0]);
          }}
        />
        <ActionIcon
          disabled={form.values.clients?.length === 1}
          pos="absolute"
          top={rem(28)}
          right="0"
          color="red"
          onClick={() => form.removeListItem("clients", index)}
        >
          <IconTrash size="1rem" />
        </ActionIcon>
      </Group>
      <Group w={`calc(100% - ${rem(45)})`} mt="xs" align="flex-end">
        <NumberInput
          {...form.getInputProps(`clients.${index}.approxAge`)}
          withAsterisk
          flex="1"
          label="Gesch. Alter"
        />
        <div>
          <SegmentedControl
            {...form.getInputProps(`clients.${index}.gender`)}
            data={GenderOptions}
            mb={form.errors[`clients.${index}.approxAge`] ? rem(17) : rem(-2)}
          />
        </div>
      </Group>
    </Fieldset>
  ));

  return (
    <>
      <InputLabel required w="100%" mb="xs">
        Klienten
      </InputLabel>
      {form.errors.clients && <InputError>{form.errors.clients}</InputError>}
      {clientFields}
      <ActionIcon
        mt={form.getValues().clients?.length > 0 ? undefined : "md"}
        onClick={() =>
          form.insertListItem("clients", {
            id: undefined,
            name: "",
            approxAge: undefined,
            gender: null,
          })
        }
      >
        <IconPlus />
      </ActionIcon>
    </>
  );
};
