import type { AccessoryWarranty } from "./warranty";
import { getWarrantyPeriodUnitLabel } from "./warranty-period-unit";

export function formatWarrantyDuration(duration: number, unit: AccessoryWarranty["durationUnit"]): string {
  const label = getWarrantyPeriodUnitLabel(unit);
  if (!label) return String(duration);
  return `${duration} ${duration === 1 ? label.slice(0, -1) : label}`;
}

export function formatWarrantyDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}
