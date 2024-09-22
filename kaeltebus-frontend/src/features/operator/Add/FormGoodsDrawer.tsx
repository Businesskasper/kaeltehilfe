import {
  Accordion,
  ActionIcon,
  Drawer,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useField } from "@mantine/form";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import React from "react";
import {
  Good,
  GoodType,
  GoodTypeTranslation,
  useGoods,
} from "../../../common/app";
import { classes, useBreakpoint } from "../../../common/utils";
import { useDistributionFormContext } from "./DistributionFormContext";
import { GoodListItem } from "./GoodListItem";

export type FormGoodsDrawerProps = {
  isOpened: boolean;
  close: () => void;
};
export const FormGoodsDrawer = ({ isOpened, close }: FormGoodsDrawerProps) => {
  const {
    objs: { isLoading, data: goods },
  } = useGoods();

  const form = useDistributionFormContext();

  const goodTypes: Array<GoodType> = ["FOOD", "CLOTHING", "CONSUMABLE"];

  const searchField = useField({
    mode: "controlled",
    initialValue: "",
    type: "input",
  });
  const searchValue = searchField.getInputProps().value;
  const filteredGoods = React.useMemo(() => {
    return searchValue?.trim()
      ? goods?.filter(
          (good) =>
            good.name?.toUpperCase()?.includes(searchValue?.toUpperCase()) ||
            good.tags?.find((tag) =>
              tag.includes(searchValue?.toUpperCase())
            ) ||
            good.description
              ?.toUpperCase()
              ?.includes(searchValue?.toUpperCase())
        ) || []
      : goods || [];
  }, [goods, searchValue]);

  const filteredGoodTypes = Array.from(
    new Set(filteredGoods?.map((good) => good.goodType?.toString() || ""))
  );

  const addGood = (good: Good) => {
    const existingGood = form.values.goods?.find((g) => g.id === good.id);
    if (!existingGood) {
      form.setFieldValue("goods", [
        ...form.values.goods,
        { id: good.id, quantity: 1 },
      ]);
    } else {
      const index = form.values.goods.indexOf(existingGood);
      const clone = form.values.goods.map((g) => g);
      clone[index].quantity++;
      form.setFieldValue("goods", clone);
    }
  };

  const removeGood = (good: Good) => {
    const existingGood = form.values.goods?.find((g) => g.id === good.id);
    if (!existingGood) return;

    const index = form.values.goods.indexOf(existingGood);
    const clone = form.values.goods.map((g) => g);
    clone.splice(index, 1);
    form.setFieldValue("goods", clone);
  };

  const breakpoint = useBreakpoint();

  return (
    <Drawer
      className={classes({
        FormGoodDrawer: true,
        IsLoading: isLoading,
      })}
      size={breakpoint === "BASE" || breakpoint === "XS" ? "100%" : "50%"}
      position="right"
      opened={isOpened}
      onClose={close}
      // title="Güter wählen"
      title={<Title order={4}>Güter wählen</Title>}
      // title={
      //   <TextInput
      //     width="100%"
      //     placeholder="Suche..."
      //     {...searchField.getInputProps()}
      //   />
      // }
    >
      {isLoading && <LoadingOverlay visible />}
      <Drawer.Body>
        <TextInput
          placeholder="Suche..."
          {...searchField.getInputProps()}
          rightSection={
            <ActionIcon
              size="xs"
              disabled={!searchValue}
              onClick={() => searchField.reset()}
              variant="transparent"
            >
              <IconX />
            </ActionIcon>
          }
        />
        <Accordion
          multiple
          defaultValue={
            filteredGoodTypes?.length > 0 ? filteredGoodTypes : goodTypes
          }
        >
          {goodTypes.map((goodType) => {
            const translation =
              GoodTypeTranslation[goodType as keyof typeof GoodTypeTranslation];

            const goodList = filteredGoods?.filter(
              (g) => g.goodType === goodType
            );

            return (
              <Accordion.Item mt="md" key={goodType} value={goodType}>
                <Accordion.Control disabled={goodList?.length === 0}>
                  {translation.label}
                </Accordion.Control>
                {goodList && goodList.length > 0 && (
                  <Accordion.Panel>
                    <Stack my="md" gap="md">
                      {goodList?.map((good) => {
                        const exists = !!form.values.goods?.find(
                          (g) => g.id === good.id
                        );
                        return (
                          <GoodListItem good={good} key={good.id}>
                            {exists ? (
                              <ActionIcon
                                onClick={() => removeGood(good)}
                                color="red"
                              >
                                <IconTrash />
                              </ActionIcon>
                            ) : (
                              <ActionIcon onClick={() => addGood(good)}>
                                <IconPlus />
                              </ActionIcon>
                            )}
                          </GoodListItem>
                        );
                      })}
                    </Stack>
                  </Accordion.Panel>
                )}
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Drawer.Body>
    </Drawer>
  );
};
