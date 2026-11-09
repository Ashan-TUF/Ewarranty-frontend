// Mirrors the backend WarrantyPeriodUnit enum in Models/Enums/WarrantyPeriodUnit.cs.
export const warrantyPeriodUnit = {
  Days: 1,
  Months: 2,
  Years: 3,
} as const;

export type WarrantyPeriodUnitValue = (typeof warrantyPeriodUnit)[keyof typeof warrantyPeriodUnit];

export const warrantyPeriodUnitOptions = [
  { value: warrantyPeriodUnit.Days, label: "Days" },
  { value: warrantyPeriodUnit.Months, label: "Months" },
  { value: warrantyPeriodUnit.Years, label: "Years" },
] as const;

export function getWarrantyPeriodUnitValue(unit: number | string): WarrantyPeriodUnitValue | null {
  const option = warrantyPeriodUnitOptions.find((item) => String(item.value) === String(unit) || item.label.toLowerCase() === String(unit).toLowerCase());
  return option?.value ?? null;
}

export function getWarrantyPeriodUnitLabel(unit: number | string): string | null {
  const value = getWarrantyPeriodUnitValue(unit);
  return warrantyPeriodUnitOptions.find((item) => item.value === value)?.label ?? null;
}
