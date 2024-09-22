export type Gender = "MALE" | "FEMALE" | "DIVERSE";

export const GenderTranslation: {
  [key in Gender]: { label: string };
} = {
  MALE: {
    label: "männlich",
  },
  FEMALE: {
    label: "weiblich",
  },
  DIVERSE: {
    label: "divers",
  },
};

export const GenderOptions = Object.keys(GenderTranslation).map((gender) => ({
  value: gender,
  label: GenderTranslation[gender as Gender].label || "",
}));
