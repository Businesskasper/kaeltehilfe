import {
  ActionIcon,
  Group,
  InputError,
  InputLabel,
  Skeleton,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useGoods } from "../../../common/app";
import {
  DistributionFormGood,
  useDistributionFormContext,
} from "./DistributionFormContext";
import { FormGoodsDrawer } from "./FormGoodsDrawer";
import { GoodListItem } from "./GoodListItem";

type FormGoodsProps = {
  isDrawerOpen: boolean;
  closeDrawer: () => void;
};
export const FormGoods = ({ isDrawerOpen, closeDrawer }: FormGoodsProps) => {
  const form = useDistributionFormContext();

  return (
    <>
      <InputLabel required w="100%" mb="xs">
        Güter
      </InputLabel>
      <Stack gap="md">
        <FormGoodsDrawer isOpened={isDrawerOpen} close={closeDrawer} />
        {form.errors.goods && <InputError>{form.errors.goods}</InputError>}
        {form.values.goods?.map((selectedGood, index) => {
          return <GoodSelection key={index} selectedGood={selectedGood} />;
        })}
      </Stack>
    </>
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
