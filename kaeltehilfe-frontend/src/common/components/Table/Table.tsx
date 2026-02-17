import {
  ActionIcon,
  ActionIconProps,
  Box,
  Button,
  DefaultMantineColor,
  Tooltip,
  rem,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconEdit,
  IconFileExcel,
  IconPlus,
  IconProps,
  IconTrash,
} from "@tabler/icons-react";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_ColumnSizingState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_TableOptions,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { MRT_Localization_DE } from "mantine-react-table/locales/de/index.cjs";
import React, { ComponentType } from "react";
import * as XLSX from "xlsx";
import { useBreakpoint } from "../../utils";
import { ValueTypeProps } from "../../utils/types";

import "./Table.scss";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExportConfig<T extends Record<string, any>> = {
  fileName: string | (() => string);
  transformators?: { [key in keyof T]?: Transformator<T> };
  manualColumns?: Array<{ key: string; transformFn: TransformFn<T> }>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Transformator<T extends Record<string, any>> = {
  columnName: string;
  transformFn: TransformFn<T>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransformFn<T extends Record<string, any>> = (
  obj: T,
) => string | number | Date | boolean;

export type AdditionalCustomAction<T> = {
  label: string;
  icon: ComponentType<IconProps>;
  isDisabled: (selectedItems: Array<T>) => boolean;
  onClick: (selectedItems: Array<T>) => void;
  color?: DefaultMantineColor;
  variant?: ActionIconProps["variant"];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<T extends Record<string, any>> = {
  data: Array<T>;
  columns: MRT_ColumnDef<T, unknown>[];
  isLoading: boolean;
  keyGetter:
    | ValueTypeProps<T, string | number>
    | ((item: T) => string | number);
  handleDelete?: (items: Array<T>) => void;
  handleAdd?: () => void;
  handleEdit?: (item: T) => void;
  exportConfig?: ExportConfig<T>;
  fillScreen?: boolean;
  tableKey: string;
  renderDetailPanel?: MRT_TableOptions<T>["renderDetailPanel"];
  setSelected?: React.Dispatch<React.SetStateAction<Array<T>>>;
  defaultSorting?: MRT_SortingState;
  customActions?: Array<AdditionalCustomAction<T>>;
  customHeaderChildren?: React.JSX.Element | Array<React.JSX.Element>;
  enableGrouping?: boolean;
  hideTopToolbarActions?: boolean;
  disablePagination?: boolean;
  renderRowActionMenuItems?: MRT_TableOptions<T>["renderRowActionMenuItems"];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Table = <T extends Record<string, any>>({
  data,
  columns,
  keyGetter,
  isLoading,
  handleAdd,
  handleDelete,
  handleEdit,
  exportConfig,
  fillScreen,
  tableKey,
  renderDetailPanel,
  setSelected,
  defaultSorting,
  customActions,
  customHeaderChildren,
  enableGrouping,
  hideTopToolbarActions,
  disablePagination,
  renderRowActionMenuItems,
}: Props<T>) => {
  const [rowSelection, setRowSelection] = React.useState({});
  const getRowId = React.useCallback(
    (item: T) =>
      typeof keyGetter === "function" ? keyGetter(item) : item[keyGetter],
    [keyGetter],
  );

  // Update row selection state after data changed
  // Otherwise, after row deletion, they might be left dangling in the selection state, invisible to the user
  React.useEffect(() => {
    const existingIds = data.map(getRowId);
    setRowSelection((currentRowSelection: MRT_RowSelectionState) => {
      const selectedIds = Object.keys(currentRowSelection).filter(
        (key) => currentRowSelection[key] === true,
      );

      return selectedIds.reduce((newState, selectedId) => {
        return existingIds.includes(selectedId)
          ? { ...newState, [selectedId]: true }
          : newState;
      }, {} as MRT_RowSelectionState);
    });
  }, [data, getRowId]);

  const [columnSizing, setColumnSizing] =
    useLocalStorage<MRT_ColumnSizingState>({
      key: `${tableKey}_columns`,
      defaultValue: {},
    });
  const [columnFilters, setColumnFilters] =
    useLocalStorage<MRT_ColumnFiltersState>({
      key: `${tableKey}_filters`,
      defaultValue: [],
    });
  const [pagination, setPagination] = useLocalStorage<MRT_PaginationState>({
    key: `${tableKey}_pagination`,
    defaultValue: { pageIndex: 0, pageSize: 20 },
  });
  const [grouping, setGrouping] = useLocalStorage<MRT_GroupingState>({
    key: `${tableKey}_grouping`,
    defaultValue: [],
  });

  const table = useMantineReactTable<T>({
    localization: MRT_Localization_DE,
    enableRowSelection: true,
    getRowId: (obj) => String(getRowId(obj)),
    positionToolbarAlertBanner: "bottom",
    renderTopToolbar:
      hideTopToolbarActions &&
      !handleDelete &&
      !handleEdit &&
      !handleAdd &&
      (!customActions || customActions.length === 0)
        ? false
        : undefined,
    renderTopToolbarCustomActions: (table) => (
      <>
        <CustomActions
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          table={table.table}
          customActions={customActions}
        />
        {customHeaderChildren && customHeaderChildren}
      </>
    ),
    renderToolbarInternalActions: ({ table }) =>
      hideTopToolbarActions ? (
        false
      ) : (
        <InternalActions table={table} exportConfig={exportConfig} />
      ),
    selectAllMode: "page",
    layoutMode: "grid",
    state: {
      isLoading: isLoading && data.length === 0,
      rowSelection,
      columnSizing,
      columnFilters,
      pagination,
      grouping,
    },
    onRowSelectionChange: setRowSelection,
    initialState: {
      density: "xs",
      sorting: defaultSorting || [],
    },
    data: data || [],
    columns,
    mantinePaperProps: {
      className: fillScreen ? "table-fill-screen" : undefined,
    },
    renderDetailPanel,
    mantineTableContainerProps: {
      className: fillScreen ? "container-fill-screen" : undefined,
    },
    enableColumnResizing: true,
    onColumnSizingChange: setColumnSizing,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableGrouping,
    onGroupingChange: setGrouping,
    enablePagination: !disablePagination,
    enableBottomToolbar: !disablePagination,
    enableRowActions: !!renderRowActionMenuItems,
    renderRowActionMenuItems,
  });

  React.useEffect(() => {
    const selectedData =
      table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
        ? table.getSelectedRowModel()?.rows.map((r) => r.original)
        : [];

    setSelected && setSelected(selectedData);
  }, [rowSelection, setSelected, table, data]);

  return <MantineReactTable table={table}></MantineReactTable>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomActionsProps<T extends Record<string, any>> = {
  table: MRT_TableInstance<T>;
  handleDelete?: (items: Array<T>) => void;
  handleAdd?: () => void;
  handleEdit?: (item: T) => void;
  customActions?: Array<AdditionalCustomAction<T>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomActions = <T extends Record<string, any>>({
  table,
  handleAdd,
  handleDelete,
  handleEdit,
  customActions,
}: CustomActionsProps<T>) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "BASE" || breakpoint === "XS";

  const selectedData =
    table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
      ? table.getSelectedRowModel()?.rows.map((r) => r.original)
      : [];

  return (
    <Box
      style={{ display: "flex", alignItems: "center", gap: rem(16), p: rem(4) }}
    >
      {handleDelete && !isMobile && (
        <Button
          disabled={selectedData.length === 0}
          color="red"
          onClick={() => handleDelete(selectedData)}
          variant="outline"
        >
          Löschen
        </Button>
      )}
      {handleDelete && isMobile && (
        <ActionIcon
          disabled={selectedData.length === 0}
          color="red"
          onClick={() => handleDelete(selectedData)}
          variant="outline"
        >
          <IconTrash />
        </ActionIcon>
      )}
      {handleEdit && !isMobile && (
        <Button
          disabled={selectedData.length !== 1}
          color="blue"
          onClick={() => handleEdit(selectedData[0])}
          variant="default"
        >
          Bearbeiten
        </Button>
      )}
      {handleEdit && isMobile && (
        <ActionIcon
          disabled={selectedData.length !== 1}
          color="blue"
          onClick={() => handleEdit(selectedData[0])}
          variant="defalut"
        >
          <IconEdit />
        </ActionIcon>
      )}
      {handleAdd && !isMobile && (
        <Button
          disabled={selectedData.length > 0}
          color="blue"
          onClick={handleAdd}
          variant="filled"
        >
          Hinzufügen
        </Button>
      )}
      {handleAdd && isMobile && (
        <ActionIcon
          disabled={selectedData.length > 0}
          color="blue"
          onClick={handleAdd}
          variant="filled"
        >
          <IconPlus />
        </ActionIcon>
      )}
      {customActions?.map((customAction, index) => {
        return isMobile ? (
          <ActionIcon
            key={index}
            disabled={customAction.isDisabled(selectedData)}
            color={customAction.color}
            onClick={() => customAction.onClick(selectedData)}
            variant={customAction.variant}
          >
            <customAction.icon />
          </ActionIcon>
        ) : (
          <Button
            key={index}
            disabled={customAction.isDisabled(selectedData)}
            color={customAction.color}
            onClick={() => customAction.onClick(selectedData)}
            variant={customAction.variant}
          >
            {customAction.label}
          </Button>
        );
      })}
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalActionProps<T extends Record<string, any>> = {
  table: MRT_TableInstance<T>;
  exportConfig?: ExportConfig<T>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InternalActions = <T extends Record<string, any>>({
  table,
  exportConfig,
}: InternalActionProps<T>) => {
  const isSomeSelected = table.getIsSomeRowsSelected();

  const onPrintExcelClick = () => {
    const selectedData = (
      isSomeSelected ? table.getSelectedRowModel() : table.getRowModel()
    ).rows.map((row) => row.original);

    const transformedData = selectedData.map((selectedItem) => {
      const transformedObject = Object.keys(selectedItem).reduce(
        (transformedObj, key) => {
          const keyConfig = exportConfig?.transformators?.[key];

          const value = keyConfig?.transformFn
            ? keyConfig.transformFn(selectedItem)
            : selectedItem[key];

          const header = keyConfig?.columnName ?? key;

          return { ...transformedObj, [header]: value };
        },
        {} as { [key: string]: string | number | boolean | Date },
      );
      for (const manualColumn of exportConfig?.manualColumns || []) {
        transformedObject[manualColumn.key] =
          manualColumn.transformFn(selectedItem);
      }
      return transformedObject;
    });

    const fileName = exportConfig?.fileName
      ? typeof exportConfig.fileName === "function"
        ? exportConfig.fileName()
        : exportConfig.fileName
      : "";

    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mappe1");
    XLSX.writeFile(workbook, fileName || "Export.xlsx", { compression: true });
  };
  return (
    <Box style={{ display: "flex", gap: rem(4.8) }}>
      <MRT_ToggleGlobalFilterButton table={table} />
      <MRT_ToggleFiltersButton table={table} />
      <MRT_ShowHideColumnsButton table={table} />
      <MRT_ToggleDensePaddingButton table={table} />
      {exportConfig?.fileName && (
        <Tooltip
          label={
            isSomeSelected
              ? "Ausgewählte Einträge exportieren"
              : "Alle Einträge exportieren"
          }
        >
          <ActionIcon
            onClick={onPrintExcelClick}
            className="table-action-icon"
            variant="default"
            display="inline-flex"
            h="var(--ai-size-lg)"
            w="var(--ai-size-lg)"
            c="var(--mantine-color-gray-light-color)"
            bd="1px solid transparent"
          >
            <IconFileExcel />
          </ActionIcon>
        </Tooltip>
      )}

      <MRT_ToggleFullScreenButton table={table} />
    </Box>
  );
};
