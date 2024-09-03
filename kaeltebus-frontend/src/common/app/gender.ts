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
