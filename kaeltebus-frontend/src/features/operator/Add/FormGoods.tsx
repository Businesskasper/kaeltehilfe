import {
  ActionIcon,
  Group,
  InputError,
  Skeleton,
  Stack,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarRightExpand,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useGoods } from "../../../common/app";
import { useBreakpoint } from "../../../common/utils";
import {
  DistributionFormGood,
  useDistributionFormContext,
} from "./DistributionFormContext";
import { FormGoodsDrawer } from "./FormGoodsDrawer";
import { GoodListItem } from "./GoodListItem";

type FormGoodsProps = {
  drawerDislosure: ReturnType<typeof useDisclosure>;
};
export const FormGoods = ({ drawerDislosure }: FormGoodsProps) => {
  const form = useDistributionFormContext();

  const [isOpened, { close, open }] = drawerDislosure;

  const breakpoint = useBreakpoint();
  const isDesktop =
    breakpoint === "SM" ||
    breakpoint === "MD" ||
    breakpoint === "LG" ||
    breakpoint === "XL";

  return (
    <Stack gap="md">
      <Group
        onClick={open}
        justify={isDesktop ? "space-between" : "flex-end"}
        align="baseline"
      >
        {isDesktop && (
          <Title mt={isDesktop ? "sm" : undefined} mb="md" order={3}>
            Ausgabe
          </Title>
        )}
        <ActionIcon variant="transparent" color="gray">
          <IconLayoutSidebarRightExpand />
        </ActionIcon>
      </Group>
      <FormGoodsDrawer isOpened={isOpened} close={close} />
      {form.errors.goods && <InputError>{form.errors.goods}</InputError>}
      {form.values.goods?.map((selectedGood, index) => {
        return <GoodSelection key={index} selectedGood={selectedGood} />;
      })}
    </Stack>
  );
};

const GoodSelection = ({
  selectedGood,
}: {
  selectedGood: DistributionFormGood;
}) => {
  const {
    objs: { data: goods },
  } = useGoods();

  const form = useDistributionFormContext();

  const { colors } = useMantineTheme();

  const adjustQuantity = (
    existingGood: DistributionFormGood,
    action: "INCREASE" | "DECREASE"
  ) => {
    const index = form.values.goods.indexOf(existingGood);
    const clone = form.values.goods.map((g) => g);
    if (action === "INCREASE") {
      clone[index].quantity++;
    } else if (existingGood.quantity > 1) {
      clone[index].quantity--;
    } else {
      clone.splice(index, 1);
    }
    form.setFieldValue("goods", clone);
  };

  const goodSource = goods?.find((g) => g.id === selectedGood.id);
  if (!goodSource) return <Skeleton />;

  return (
    <GoodListItem good={goodSource}>
      <Group>
        <ActionIcon
          variant="default"
          onClick={() => adjustQuantity(selectedGood, "DECREASE")}
        >
          {selectedGood.quantity > 1 ? (
            <IconMinus color={colors.red[0]} />
          ) : (
            <IconTrash color={colors.red[0]} />
          )}
        </ActionIcon>
        {selectedGood.quantity}
        <ActionIcon
          variant="default"
          onClick={() => adjustQuantity(selectedGood, "INCREASE")}
        >
          <IconPlus color={colors.blue[0]} />
        </ActionIcon>
      </Group>
    </GoodListItem>
  );
};
