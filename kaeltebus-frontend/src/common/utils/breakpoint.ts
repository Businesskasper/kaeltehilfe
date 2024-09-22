import { useViewportSize } from "@mantine/hooks";

type Breakpoint = "XS" | "SM" | "MD" | "LG" | "XL" | "BASE";

export const useBreakpoint = (): Breakpoint => {
  const { width } = useViewportSize();

  // const body = document?.querySelector("body");
  // const hasBody = !!body;

  // const inEm = React.useMemo(() => {
  //   if (!body) return null;

  //   return body ? width / parseFloat(getComputedStyle(body)["fontSize"]) : null;
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [hasBody, width]);

  // console.log(width, inEm);

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

  // return inEm === null
  //   ? "BASE"
  //   : inEm >= 88
  //   ? "XL"
  //   : inEm >= 75
  //   ? "LG"
  //   : inEm >= 62
  //   ? "MD"
  //   : inEm >= 48
  //   ? "SM"
  //   : inEm >= 36
  //   ? "XS"
  //   : "BASE";
};

// Breakpoint	Viewport width	Value in px
// xs	36em	576px
// sm	48em	768px
// md	62em	992px
// lg	75em	1200px
// xl	88em	1408px
