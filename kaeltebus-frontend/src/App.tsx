import { MantineProvider, colorsTuple } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

import "./App.scss";

function App() {
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        colors: {
          red: colorsTuple("#e60005"),
          soft_red: colorsTuple("#e46450"),
          dark_red: colorsTuple("#a51e0f"),
          light_blue: colorsTuple("#EBF5FF"),
          blue: colorsTuple("#2275D0"),
          middle_blue: colorsTuple("#008CCD"),
          dark_blue: colorsTuple("#002D55"),
          light_gray: colorsTuple("#EFEEEA"),
          middle_gray: colorsTuple("#B4B4B4"),
          dark_gray: colorsTuple("#554F4A"),
          country_gray: colorsTuple("#D9D9D9"),
        },
        primaryColor: "blue",
      }}
    >
      <Notifications position="bottom-center" />
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
