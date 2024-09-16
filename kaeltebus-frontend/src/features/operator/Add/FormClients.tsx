import { ActionIcon, Group, InputLabel } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useClients } from "../../../common/app";
import { FormSelect } from "../../../common/components";

type ClientsForm = {
  clients: Array<{ id: number; name: string }>;
};

// export const AddClients = ({}: AddClientsProps) => {
export const FormClients = () => {
  const {
    objs: { data: clients },
  } = useClients();

  const form = useForm<ClientsForm>({
    mode: "controlled",
    initialValues: {
      clients: [],
    },
  });

  const clientFields = form.getValues().clients?.map((_, index) => (
    <Group
      mt={index > 0 ? "md" : undefined}
      mb="md"
      key={index}
      align="baseline"
      pos="relative"
    >
      <FormSelect
        searchable
        items={clients || []}
        valueGetter="name"
        sort
        style={{ width: "calc(100% - 35px)" }}
        formProps={form.getInputProps(`clients.${index}.name`)}
        onItemSelected={(selectedClient) => {
          form.setFieldValue(`clients.${index}.id`, selectedClient?.id);
        }}
        onBlur={() => {
          // In case on option was selected (but typed), we must manually set the volunteers id
          const currentClient = form.getValues()?.clients[index];
          if (
            !currentClient ||
            !currentClient.name ||
            (currentClient.id &&
              clients?.find((v) => v.id)?.name === currentClient.name)
          ) {
            return;
          }
          const clientObj = clients?.filter(
            (v) => v.name === currentClient.name
          );
          if (!clientObj || clientObj.length === 0) {
            return;
          }
          if (clientObj.length > 1) {
            return;
          }
          form.setFieldValue(`clients.${index}.id`, clientObj[0].id);
        }}
      />
      <ActionIcon
        // h="35px"
        pos="absolute"
        top="3px"
        right="0px"
        color="red"
        onClick={() => form.removeListItem("clients", index)}
      >
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  const onSubmit = (formModel: ClientsForm) => {
    console.log("submit", formModel);
  };

  return (
    <form style={{ display: "contents" }} onSubmit={form.onSubmit(onSubmit)}>
      <InputLabel required w="100%">
        Klienten
      </InputLabel>
      {clientFields}
      <ActionIcon
        mt={form.getValues().clients?.length > 0 ? undefined : "md"}
        onClick={() =>
          form.insertListItem("clients", { id: undefined, name: "" })
        }
      >
        <IconPlus />
      </ActionIcon>
    </form>
  );
};
