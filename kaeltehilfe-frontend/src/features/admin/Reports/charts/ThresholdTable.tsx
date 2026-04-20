import { Badge, Center, Table, Text } from "@mantine/core";
import { Distribution, Good, GoodTypeTranslation } from "../../../../common/data";
import { formatDate } from "../../../../common/utils";
import { buildThresholdRows, ThresholdRow } from "../reportUtils";

type Props = { distributions: Distribution[]; goods: Good[]; from: Date; to: Date };

const statusColor = (status: ThresholdRow["status"]) => {
  if (status === "EXCEEDED") return "red";
  if (status === "WARNING") return "yellow";
  return "green";
};

const statusLabel = (status: ThresholdRow["status"]) => {
  if (status === "EXCEEDED") return "Überschritten";
  if (status === "WARNING") return "Warnung";
  return "OK";
};

export const ThresholdTable = ({ distributions, goods, from, to }: Props) => {
  const rows = buildThresholdRows(distributions, goods, from, to);

  if (rows.length === 0) {
    return (
      <Center h={120}>
        <Text c="dimmed" size="sm">Keine Ausgaben gegen Schwellenwert in den letzten 14 Tagen</Text>
      </Center>
    );
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders fz="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Zeitfenster</Table.Th>
          <Table.Th>Gut</Table.Th>
          <Table.Th>Typ</Table.Th>
          <Table.Th>Klient</Table.Th>
          <Table.Th ta="right">Ausgegeben</Table.Th>
          <Table.Th ta="right">Schwellenwert</Table.Th>
          <Table.Th ta="center">Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={`${row.windowStart.toISOString()}:${row.goodId}:${row.clientId}`}>
            <Table.Td style={{ whiteSpace: "nowrap" }}>
              {formatDate(row.windowStart)} – {formatDate(row.windowEnd)}
            </Table.Td>
            <Table.Td>{row.goodName}</Table.Td>
            <Table.Td>{GoodTypeTranslation[row.goodType]?.label ?? row.goodType}</Table.Td>
            <Table.Td>{row.clientName}</Table.Td>
            <Table.Td ta="right">{row.distributed}</Table.Td>
            <Table.Td ta="right">{row.threshold}</Table.Td>
            <Table.Td ta="center">
              <Badge color={statusColor(row.status)} variant="filled" size="sm">
                {statusLabel(row.status)}
              </Badge>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
