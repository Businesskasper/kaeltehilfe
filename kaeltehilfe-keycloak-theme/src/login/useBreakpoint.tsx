import { useViewportSize } from "@mantine/hooks";

type Breakpoint = "XS" | "SM" | "MD" | "LG" | "XL" | "BASE";

export const useBreakpoint = (): Breakpoint => {
    const { width } = useViewportSize();

    return width >= 1408
        ? "XL"
        : width >= 1200
          ? "LG"
          : width >= 992
            ? "MD"
            : width >= 768
              ? "SM"
              : width >= 576
                ? "XS"
                : "BASE";
};

// Breakpoint	Viewport width	Value in px
// xs	36em	576px
// sm	48em	768px
// md	62em	992px
// lg	75em	1200px
// xl	88em	1408px
