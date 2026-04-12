import {
  IconBackpack,
  IconBedFlat,
  IconHandSanitizer,
  IconPackage,
  IconProps,
  IconShirt,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import { ComponentType } from "react";
import { useCrudHook } from "../utils/crudHook";

export type GoodType =
  | "CONSUMABLE"
  | "CLOTHING"
  | "FOOD"
  | "HYGIENE"
  | "BEDDING"
  | "EQUIPMENT";

export type Good = {
  id: number;
  name?: string;
  description?: string;
  tags: Array<string>;
  goodType?: GoodType;
  twoWeekThreshold?: number;
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
    icon: IconPackage,
  },
  FOOD: {
    label: "Nahrung",
    icon: IconToolsKitchen2,
  },
  HYGIENE: {
    label: "Hygiene",
    icon: IconHandSanitizer,
  },
  BEDDING: {
    label: "Schlafzeug",
    icon: IconBedFlat,
  },
  EQUIPMENT: {
    label: "Ausrüstung",
    icon: IconBackpack,
  },
};

export const useGoods = () =>
  useCrudHook<Good, never, Omit<Good, "id">>({ key: "goods" });
