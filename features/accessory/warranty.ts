import api from "@/lib/axios";
import { AxiosError } from "axios";
import type { CreateWarrantyTypeForm } from "@/features/machine/schemas/warranty-type.schema";

export interface AccessoryWarranty {
  id: number; accessoryId: number; accessoryCode: string; accessoryName: string;
  accessoryTypeId?: number; accessoryTypeCode?: string; accessoryTypeName?: string;
  warrantyTypeId: number; warrantyTypeCode?: string; warrantyTypeName: string;
  duration: number; durationUnit: number | "Days" | "Months" | "Years"; isActive: boolean;
  createdAt: string; updatedAt: string | null;
}
export interface WarrantyPage { items: AccessoryWarranty[]; page: number; pageSize: number; totalCount: number; totalPages: number }
export interface WarrantySearch { search?: string; warrantyTypeId?: number; isActive?: boolean; sortBy: string; sortDirection: "asc" | "desc"; page: number; pageSize: number }
export interface WarrantyTypeOption { id: number; code: string; name: string; isActive: boolean }
export interface WarrantyPayload { warrantyTypeId: number; duration: number; durationUnit: AccessoryWarranty["durationUnit"]; isActive: boolean }

const root = "/AccessoryWarranty";
export const getWarranties = async (params: WarrantySearch) => (await api.get<WarrantyPage>(root, { params })).data;
export const getWarranty = async (id: number) => (await api.get<AccessoryWarranty>(`${root}/${id}`)).data;
export const getAccessoryWarranty = async (code: string) => (await api.get<AccessoryWarranty>(`${root}/accessory/${encodeURIComponent(code)}`)).data;
export const createWarranty = async (payload: WarrantyPayload & { accessoryCode: string }) => (await api.post<AccessoryWarranty>(root, payload)).data;
export const updateWarranty = async (id: number, payload: WarrantyPayload) => (await api.put<AccessoryWarranty>(`${root}/${id}`, payload)).data;
export const setWarrantyStatus = async (id: number, isActive: boolean) => (await api.patch<AccessoryWarranty>(`${root}/${id}/status`, { isActive })).data;
export interface CreatedWarrantyType { id: number; warrantyTypeCode: string; warrantyTypeName: string; isActive: boolean }
export const createWarrantyType = async (payload: CreateWarrantyTypeForm) => {
  const response: unknown = (await api.post<unknown>("/warranty-types", payload)).data;
  const envelope = response && typeof response === "object" ? response as Record<string, unknown> : null;
  const item = envelope?.data ?? response;
  if (!item || typeof item !== "object") throw new Error("The warranty type API returned an invalid creation response.");
  const row = item as Record<string, unknown>;
  if (!Number.isSafeInteger(row.id) || Number(row.id) <= 0 || typeof row.warrantyTypeCode !== "string" || !row.warrantyTypeCode.trim() || typeof row.warrantyTypeName !== "string" || !row.warrantyTypeName.trim()) throw new Error("The warranty type API did not return the saved type's ID, code, and name.");
  return { id: Number(row.id), warrantyTypeCode: row.warrantyTypeCode.trim(), warrantyTypeName: row.warrantyTypeName.trim(), isActive: row.isActive === true };
};
export const getWarrantyTypeOptions = async (): Promise<WarrantyTypeOption[]> => {
  const response: unknown = (await api.get<unknown>("/warranty-types")).data;
  const body = response && typeof response === "object" ? response as Record<string, unknown> : null;
  const data = body?.data ?? response;
  const page = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
  const items = Array.isArray(data) ? data : page?.items;
  if (!Array.isArray(items)) throw new Error("The warranty type API returned an invalid list. Please retry.");
  return items.map((value): WarrantyTypeOption => {
    if (!value || typeof value !== "object") throw new Error("The warranty type API returned an invalid entry.");
    const row = value as Record<string, unknown>;
    if (!Number.isSafeInteger(row.id) || Number(row.id) <= 0 || typeof row.warrantyTypeCode !== "string" || !row.warrantyTypeCode.trim() || typeof row.warrantyTypeName !== "string" || !row.warrantyTypeName.trim() || typeof row.isActive !== "boolean") throw new Error("The warranty type API returned an entry without a valid ID, code, name, or active status.");
    return { id: Number(row.id), code: row.warrantyTypeCode.trim(), name: row.warrantyTypeName.trim(), isActive: row.isActive };
  });
};
export function warrantyError(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const message = data?.errors && Object.values(data.errors).flat()[0];
    if (message || data?.message) return message || data!.message!;
    if (error.response?.status === 409) return "This accessory already has a warranty.";
    if (error.response?.status === 404) return "Warranty or accessory not found.";
    if (error.response?.status === 401) return "Sign in to continue.";
    if (error.response?.status === 403) return "You do not have permission for this action.";
  }
  return error instanceof Error ? error.message : "Warranty request failed. Please try again.";
}
