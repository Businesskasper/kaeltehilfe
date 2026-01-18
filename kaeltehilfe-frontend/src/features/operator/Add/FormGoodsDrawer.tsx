import {
  Accordion,
  ActionIcon,
  Drawer,
  Group,
  Indicator,
  LoadingOverlay,
  Popover,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useField } from "@mantine/form";
import {
  IconInfoCircle,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React from "react";
import {
  Good,
  GoodType,
  GoodTypeTranslation,
  useDistributionsPaginated,
  useGoods,
} from "../../../common/data";
import {
  classes,
  useBreakpoint,
  useIsTouchDevice,
} from "../../../common/utils";
import { useDistributionFormContext } from "./DistributionFormContext";
import { GoodListItem } from "./GoodListItem";

export type FormGoodsDrawerProps = {
  isOpened: boolean;
  close: () => void;
};
export const FormGoodsDrawer = ({ isOpened, close }: FormGoodsDrawerProps) => {
  const isTouchDevice = useIsTouchDevice();

  const {
    objs: { isLoading, data: goods },
  } = useGoods();

  const {
    queryDistributionsPaginated: { data: distributionPages },
  } = useDistributionsPaginated();
  const distributions = distributionPages?.pages?.flatMap((p) => p) || [];
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
              tag?.toUpperCase()?.includes(searchValue?.toUpperCase()),
            ) ||
            good.description
              ?.toUpperCase()
              ?.includes(searchValue?.toUpperCase()),
        ) || []
      : goods || [];
  }, [goods, searchValue]);

  const filteredGoodTypes = Array.from(
    new Set(filteredGoods?.map((good) => good.goodType?.toString() || "")),
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
        "form-good-drawer": true,
        "is-loading": isLoading,
      })}
      size={breakpoint === "BASE" || breakpoint === "XS" ? "100%" : "50%"}
      position="right"
      opened={isOpened}
      onClose={close}
      title={<Title order={4}>Güter wählen</Title>}
      // title="Güter wählen"
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
            !isTouchDevice ? undefined : (
              <ActionIcon
                size="xs"
                disabled={!searchValue}
                onClick={() => searchField.reset()}
                variant="transparent"
              >
                <IconX />
              </ActionIcon>
            )
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
              (g) => g.goodType === goodType,
            );

            return (
              <Accordion.Item mt="md" key={goodType} value={goodType}>
                <Accordion.Control disabled={goodList?.length === 0}>
                  {translation.label}
                </Accordion.Control>
                {goodList && goodList.length > 0 && (
                  <Accordion.Panel>
                    <Stack my="md" gap="lg">
                      {goodList?.map((good) => {
                        const exists = !!form.values.goods?.find(
                          (g) => g.id === good.id,
                        );

                        const clients = form.values.clients;

                        const clientWarnings = new Array<JSX.Element>();

                        if (
                          good.twoWeekThreshold !== undefined &&
                          good.twoWeekThreshold !== null &&
                          !isNaN(good.twoWeekThreshold || NaN)
                        ) {
                          const goodDistributions = distributions.filter(
                            (d) => d.good.id === good.id,
                          );
                          for (const client of clients) {
                            const distributionsForClient =
                              goodDistributions.filter(
                                (d) => d.client.id === client.id,
                              );

                            const totalDistsForClient =
                              distributionsForClient.reduce(
                                (sum, acc) => sum + acc.quantity,
                                0,
                              );

                            if (totalDistsForClient >= good.twoWeekThreshold) {
                              clientWarnings.push(
                                <Text>
                                  In den letzten zwei Wochen{" "}
                                  <strong>{totalDistsForClient}</strong> mal an{" "}
                                  <strong>{client.name}</strong> ausgegeben
                                </Text>,
                              );
                            }
                          }
                        }

                        return (
                          <GoodListItem
                            good={good}
                            key={good.id}
                            onTagClicked={(value) =>
                              searchField.setValue(value)
                            }
                          >
                            <Group gap="xl">
                              {clientWarnings.length > 0 && (
                                <Popover
                                  width="auto"
                                  position="left-end"
                                  withArrow
                                  arrowOffset={14}
                                  shadow="md"
                                >
                                  <Popover.Target>
                                    <Indicator
                                      mt=".5em"
                                      processing
                                      color="orange"
                                    >
                                      <IconInfoCircle />
                                    </Indicator>
                                  </Popover.Target>
                                  <Popover.Dropdown>
                                    {clientWarnings}
                                  </Popover.Dropdown>
                                </Popover>
                              )}

                              {exists ? (
                                <ActionIcon
                                  onClick={() => removeGood(good)}
                                  color="red"
                                  variant="subtle"
                                >
                                  <IconTrash />
                                </ActionIcon>
                              ) : (
                                <ActionIcon
                                  onClick={() => addGood(good)}
                                  variant="subtle"
                                >
                                  <IconPlus />
                                </ActionIcon>
                              )}
                            </Group>
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
