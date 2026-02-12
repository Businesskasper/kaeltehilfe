import React from "react";
import { Layout } from "react-resizable-panels";
import { allStringsMatch, useBrowserStorage } from ".";

type CachedLayout<TPanel extends string> = {
  panels: TPanel[];
  panelConfigs: { [K in TPanel]: number };
};

type UseCachedLayoutProps<TPanels extends string> = {
  currentPanels: Array<TPanels>;
  initialLayout: CachedLayout<TPanels>;
  onBeforeLayoutUpdate?: (layout: Layout) => void;
  onAfterLayoutUpdate?: (layout: Layout) => void;
};

export const useCachedLayout = <TPanels extends string>({
  currentPanels,
  initialLayout,
  onBeforeLayoutUpdate,
  onAfterLayoutUpdate,
}: UseCachedLayoutProps<TPanels>) => {
  const [storedDefaultLayout, setDefaultLayout] = useBrowserStorage<
    Array<CachedLayout<TPanels>>
  >("LOCAL", "asdfasdf", [initialLayout]);

  const onLayoutChanged = React.useCallback(
    (receivedLayout: Layout) => {
      onBeforeLayoutUpdate && onBeforeLayoutUpdate(receivedLayout);
      setDefaultLayout((oldDefaultLayout) => {
        const copy = oldDefaultLayout.map((odl) => ({ ...odl }));
        const receivedPanels = Object.keys(receivedLayout) as Array<TPanels>;
        const storedLayout = copy.find((c) =>
          allStringsMatch(c.panels, receivedPanels),
        );
        if (storedLayout) {
          for (const receivedPanel of receivedPanels) {
            storedLayout.panelConfigs[receivedPanel] =
              receivedLayout[receivedPanel];
          }
        } else {
          copy.push({
            panels: receivedPanels,
            panelConfigs: receivedLayout as { [K in TPanels]: number },
          });
        }

        return copy;
      });
      onAfterLayoutUpdate && onAfterLayoutUpdate(receivedLayout);
    },
    [onAfterLayoutUpdate, onBeforeLayoutUpdate, setDefaultLayout],
  );

  const defaultLayout = React.useMemo(() => {
    return storedDefaultLayout?.find((sdl) =>
      allStringsMatch(sdl.panels, currentPanels),
    )?.panelConfigs;
  }, [currentPanels, storedDefaultLayout]);

  return { defaultLayout, onLayoutChanged };
};
