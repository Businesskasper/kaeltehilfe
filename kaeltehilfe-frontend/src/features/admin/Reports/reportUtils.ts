import { Client, Distribution, Good, GoodType, Shift, Volunteer } from "../../../common/data";
import { getDistinct, groupBy } from "../../../common/utils";

export type ReportFilters = {
  from: Date;
  to: Date;
  busIds: number[];
  goodTypes: GoodType[];
};

/** Apply global bus + goodType filters to a distribution list. Date filtering is handled by the API. */
export function filterDistributions(
  distributions: Distribution[],
  goods: Good[],
  filters: ReportFilters,
): Distribution[] {
  const goodById = new Map(goods.map((good) => [good.id, good]));
  return distributions.filter((distribution) => {
    if (filters.busIds.length > 0 && !filters.busIds.includes(distribution.bus.id)) return false;
    if (filters.goodTypes.length > 0) {
      const goodType = goodById.get(distribution.good.id)?.goodType;
      if (!goodType || !filters.goodTypes.includes(goodType)) return false;
    }
    return true;
  });
}

// Chart 1: Distributions Over Time
export type TimeSeriesPoint = { date: string; [busLabel: string]: string | number };

export function buildDistributionsOverTime(
  distributions: Distribution[],
  granularity: "daily" | "weekly",
  metric: "count" | "quantity",
): TimeSeriesPoint[] {
  const bucketKey = (distribution: Distribution) => {
    const date = new Date(distribution.timestamp);
    if (granularity === "daily") {
      return date.toISOString().slice(0, 10);
    }
    // Weekly: ISO week start (Monday)
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().slice(0, 10);
  };

  const byDate = groupBy(distributions, bucketKey);

  return Array.from(byDate.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([date, group]) => {
      const byBus = groupBy(group, (distribution) => distribution.bus.registrationNumber);
      const point: TimeSeriesPoint = { date };
      byBus.forEach((busGroup, busLabel) => {
        point[busLabel] = busGroup.reduce(
          (sum, distribution) => sum + (metric === "quantity" ? distribution.quantity : 1),
          0,
        );
      });
      return point;
    });
}

export function getUniqueBusLabels(distributions: Distribution[]): string[] {
  return getDistinct(distributions, (distribution) => distribution.bus.registrationNumber)
    .map((distribution) => distribution.bus.registrationNumber)
    .sort();
}

// Chart 2: Goods Breakdown
export type GoodsBreakdownPoint = { name: string; quantity: number; goodType: GoodType };

export function buildGoodsBreakdown(
  distributions: Distribution[],
  goods: Good[],
  mode: "item" | "type",
): GoodsBreakdownPoint[] {
  const goodById = new Map(goods.map((good) => [good.id, good]));

  if (mode === "type") {
    const byType = groupBy(
      distributions,
      (distribution) => goodById.get(distribution.good.id)?.goodType ?? ("CONSUMABLE" as GoodType),
    );
    return Array.from(byType.entries())
      .map(([type, group]) => ({
        name: type,
        quantity: group.reduce((sum, distribution) => sum + distribution.quantity, 0),
        goodType: type,
      }))
      .sort((pointA, pointB) => pointB.quantity - pointA.quantity);
  }

  const byGood = groupBy(distributions, (distribution) => distribution.good.id);
  return Array.from(byGood.entries())
    .map(([goodId, group]) => {
      const good = goodById.get(goodId);
      return {
        name: group[0].good.name,
        quantity: group.reduce((sum, distribution) => sum + distribution.quantity, 0),
        goodType: good?.goodType ?? ("CONSUMABLE" as GoodType),
      };
    })
    .sort((pointA, pointB) => pointB.quantity - pointA.quantity);
}

// Chart 3: Threshold Table
export type ThresholdRow = {
  windowStart: Date;
  windowEnd: Date;
  goodId: number;
  goodName: string;
  goodType: GoodType;
  clientId: number;
  clientName: string;
  distributed: number;
  threshold: number;
  status: "OK" | "WARNING" | "EXCEEDED";
};

export function buildThresholdRows(
  distributions: Distribution[],
  goods: Good[],
  from: Date,
  to: Date,
): ThresholdRow[] {
  const goodById = new Map(goods.map((good) => [good.id, good]));

  // Divide [from, to] into discrete non-overlapping 14-day windows
  const windows: Array<{ start: Date; end: Date }> = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= to) {
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setDate(end.getDate() + 13);
    end.setHours(23, 59, 59, 999);
    windows.push({ start, end: end > to ? new Date(to) : end });
    cursor.setDate(cursor.getDate() + 14);
  }

  const distributionsWithThreshold = distributions.filter(
    (distribution) => goodById.get(distribution.good.id)?.twoWeekThreshold,
  );

  const rows: ThresholdRow[] = [];

  for (const { start, end } of windows) {
    const inWindow = distributionsWithThreshold.filter((distribution) => {
      const timestamp = new Date(distribution.timestamp);
      return timestamp >= start && timestamp <= end;
    });

    const byGoodAndClient = groupBy(
      inWindow,
      (distribution) => `${distribution.good.id}:${distribution.client.id}`,
    );

    for (const group of byGoodAndClient.values()) {
      const first = group[0];
      const good = goodById.get(first.good.id)!;
      const threshold = good.twoWeekThreshold!;
      const distributed = group.reduce((sum, distribution) => sum + distribution.quantity, 0);
      const ratio = distributed / threshold;
      rows.push({
        windowStart: start,
        windowEnd: end,
        goodId: first.good.id,
        goodName: good.name ?? "",
        goodType: good.goodType ?? ("CONSUMABLE" as GoodType),
        clientId: first.client.id,
        clientName: first.client.name,
        distributed,
        threshold,
        status: (ratio >= 1 ? "EXCEEDED" : ratio >= 0.8 ? "WARNING" : "OK") as ThresholdRow["status"],
      });
    }
  }

  return rows.sort((rowA, rowB) => {
    // Sort by window ascending, then by ratio descending within window
    const windowDiff = rowA.windowStart.getTime() - rowB.windowStart.getTime();
    if (windowDiff !== 0) return windowDiff;
    return rowB.distributed / rowB.threshold - rowA.distributed / rowA.threshold;
  });
}

// Chart 4: Activity Per Bus
export type BusActivityPoint = { bus: string; distributions: number; quantity: number };

export function buildActivityPerBus(distributions: Distribution[]): BusActivityPoint[] {
  const byBus = groupBy(distributions, (distribution) => distribution.bus.registrationNumber);
  return Array.from(byBus.entries())
    .map(([bus, group]) => ({
      bus,
      distributions: group.length,
      quantity: group.reduce((sum, distribution) => sum + distribution.quantity, 0),
    }))
    .sort((pointA, pointB) => pointB.distributions - pointA.distributions);
}

// Chart 5: New vs Returning Clients
export type ClientRetentionPoint = { week: string; new: number; returning: number };

export function buildClientRetention(distributions: Distribution[]): ClientRetentionPoint[] {
  const weekKey = (distribution: Distribution) => {
    const date = new Date(distribution.timestamp);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().slice(0, 10);
  };

  const sorted = [...distributions].sort(
    (distA, distB) => new Date(distA.timestamp).getTime() - new Date(distB.timestamp).getTime(),
  );

  const firstSeenWeek = new Map<number, string>();
  const weekData = new Map<string, { new: number; returning: number }>();

  for (const distribution of sorted) {
    const week = weekKey(distribution);
    if (!weekData.has(week)) weekData.set(week, { new: 0, returning: 0 });
    const bucket = weekData.get(week)!;
    if (!firstSeenWeek.has(distribution.client.id)) {
      firstSeenWeek.set(distribution.client.id, week);
      bucket.new++;
    } else if (firstSeenWeek.get(distribution.client.id) !== week) {
      bucket.returning++;
    }
  }

  return Array.from(weekData.entries())
    .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
    .map(([week, counts]) => ({ week, ...counts }));
}

// Chart 6: Client Demographics
export type DemographicSlice = { name: string; value: number; color: string };

export function buildGenderDemographics(
  servedClientIds: Set<number>,
  clients: Client[],
): DemographicSlice[] {
  const servedClients = clients.filter((client) => servedClientIds.has(client.id));
  const byGender = groupBy(servedClients, (client) =>
    client.gender === "MALE" ? "männlich" :
    client.gender === "FEMALE" ? "weiblich" :
    client.gender === "DIVERSE" ? "divers" : "unbekannt",
  );
  const colors = ["#339af0", "#f06595", "#a9e34b", "#868e96"];
  return Array.from(byGender.entries())
    .map(([name, group], index) => ({ name, value: group.length, color: colors[index % colors.length] }));
}

export function buildAgeDemographics(
  servedClientIds: Set<number>,
  clients: Client[],
): DemographicSlice[] {
  const ageBucket = (client: Client): string => {
    const age = client.approxAge ?? 0;
    if (age === 0) return "unbekannt";
    if (age < 30) return "< 30";
    if (age < 50) return "30–50";
    if (age < 70) return "50–70";
    return "≥ 70";
  };

  const servedClients = clients.filter((client) => servedClientIds.has(client.id));
  const byAge = groupBy(servedClients, ageBucket);
  const colors = ["#74c0fc", "#4dabf7", "#339af0", "#1c7ed6", "#868e96"];
  return Array.from(byAge.entries())
    .map(([name, group], index) => ({ name, value: group.length, color: colors[index % colors.length] }));
}

// Chart 7: Volunteer Participation
export type VolunteerParticipationRow = {
  name: string;
  shifts: number;
};

export function buildVolunteerParticipation(
  shifts: Shift[],
  volunteers: Volunteer[],
  onlyInactive: boolean,
): VolunteerParticipationRow[] {
  const allShiftVolunteers = shifts.flatMap((shift) => shift.volunteers ?? []);
  const shiftCountById = groupBy(allShiftVolunteers, (volunteer) => volunteer.id);

  return volunteers
    .map((volunteer) => ({
      name: volunteer.fullname ?? `${volunteer.firstname} ${volunteer.lastname}`.trim(),
      shifts: shiftCountById.get(volunteer.id)?.length ?? 0,
    }))
    .filter((row) => !onlyInactive || row.shifts === 0)
    .sort((rowA, rowB) => rowB.shifts - rowA.shifts);
}

// Date preset helpers
export function getDatePreset(preset: "7d" | "30d" | "season"): { from: Date; to: Date } {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (preset === "7d") {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to: today };
  }
  if (preset === "30d") {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    return { from, to: today };
  }
  // Season: Nov 1 – Apr 30 of current/last winter
  const month = today.getMonth(); // 0-indexed
  const year = month >= 10 ? today.getFullYear() : today.getFullYear() - 1;
  const from = new Date(year, 10, 1, 0, 0, 0, 0); // Nov 1
  const to = new Date(year + 1, 3, 30, 23, 59, 59, 999); // Apr 30
  return { from, to: to > today ? today : to };
}
