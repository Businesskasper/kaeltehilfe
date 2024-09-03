import {
  IconProps,
  IconShirt,
  IconToiletPaper,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import { ComponentType } from "react";
import { useCrudHook } from "../utils/crudHook";

export type GoodType = "CONSUMABLE" | "CLOTHING" | "FOOD";

export type Good = {
  id: number;
  name?: string;
  description?: string;
  tags: Array<string>;
  goodType?: GoodType;
};

export const GoodTypeTranslation: {
  [key in GoodType]: { label: string; icon: ComponentType<IconProps> };
} = {
  CLOTHING: {
    label: "Kleidung",
    icon: IconShirt,
  },
  CONSUMABLE: {
    label: "Verbrauchsartikel",
    icon: IconToiletPaper,
  },
  FOOD: {
    label: "Nahrung",
    icon: IconToolsKitchen2,
  },
};

export const useGoods = () => useCrudHook<Good, Omit<Good, "id">>("goods");
