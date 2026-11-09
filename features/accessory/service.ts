import { AxiosError } from "axios";
import api from "@/lib/axios";
import type { AccessoryBulkImportResponse } from "./bulk-import-types";
import type { Accessory, AccessoryLookup, AccessoryPage, AccessoryPayload, AccessorySearch, ModelAccessories, ModelAccessory, AccessoryTypeSearchRequest, AccessoryTypePagedResponse, AccessoryTypeLookupResponse, AccessoryTypeResponse, CreateAccessoryTypeRequest, UpdateAccessoryTypeRequest, UpdateAccessoryTypeStatusRequest } from "./types";

const root = "/Accessory";
const codePath = (code: string) => `${root}/${encodeURIComponent(code)}`;
const modelPath = (code: string) => `${root}/models/${encodeURIComponent(code)}`;
const typeRoot = "/accessory-types";
const typePath = (code: string) => `${typeRoot}/${encodeURIComponent(code)}`;

export const downloadAccessoryImportTemplate = async () => (await api.get<Blob>(`${root}/bulk-import/template`, { responseType: "blob" })).data;
const importForm = (file: File) => { const form = new FormData(); form.append("file", file); return form; };
const uploadConfig = { headers: { "Content-Type": undefined }, timeout: 120000 };
function validateImportResponse(value: unknown): AccessoryBulkImportResponse {
  if (!value || typeof value !== "object") throw new Error("The server returned an invalid import summary. Please preview the workbook again.");
  const response = value as Record<string, unknown>;
  const counts = ["totalRows", "validRows", "invalidRows", "duplicateRows", "existingAccessoryTypes", "newAccessoryTypes", "existingAccessories", "newAccessories", "existingAssignments", "newAssignments", "reactivatedAssignments", "conflicts", "missingMachineModels"];
  if (typeof response.committed !== "boolean" || counts.some((key) => !Number.isInteger(response[key]) || (response[key] as number) < 0) || !Array.isArray(response.rows) || response.rows.some((row: unknown) => !row || typeof row !== "object" || !Array.isArray((row as Record<string, unknown>).actions) || !Array.isArray((row as Record<string, unknown>).errors))) {
    throw new Error("The server returned an incomplete import summary. Please preview the workbook again.");
  }
  return value as AccessoryBulkImportResponse;
}
export const previewAccessoryImport = async (file: File) => validateImportResponse((await api.post<unknown>(`${root}/bulk-import/preview`, importForm(file), uploadConfig)).data);
export const commitAccessoryImport = async (file: File) => (await api.post<AccessoryBulkImportResponse>(`${root}/bulk-import`, importForm(file), uploadConfig)).data;

export function accessoryError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstValidation = data?.errors && Object.values(data.errors).flat()[0];
    if (error.response?.status === 500) return "The server could not load accessories. Please try again or contact support.";
    if (firstValidation || data?.message) return firstValidation || data!.message!;
    switch (error.response?.status) {
      case 400: return "Check the entered values and try again.";
      case 401: return "Sign in to continue.";
      case 403: return "You do not have permission for this action.";
      case 404: return "This item was not found. Refresh the page and try again.";
      case 409: return "This change conflicts with an existing record.";
      default: return "Accessory request failed. Please try again.";
    }
  }
  return error instanceof Error ? error.message : "Accessory request failed.";
}

export const getAccessories = async (params: AccessorySearch) => (await api.get<AccessoryPage>(root, { params })).data;
export async function getAccessoryOverview() {
  const accessoryParams: AccessorySearch = { search: "", sortBy: "accessoryName", sortDirection: "asc", page: 1, pageSize: 100 };
  const typeParams: AccessoryTypeSearchRequest = { search: "", sortBy: "typeName", sortDirection: "asc", page: 1, pageSize: 100 };
  const [firstAccessories, firstTypes, active] = await Promise.all([
    getAccessories(accessoryParams), getAccessoryTypes(typeParams), getAccessories({ ...accessoryParams, isActive: true, pageSize: 1 }),
  ]);
  const [accessoryPages, typePages] = await Promise.all([
    Promise.all(Array.from({ length: firstAccessories.totalPages - 1 }, (_, index) => getAccessories({ ...accessoryParams, page: index + 2 }))),
    Promise.all(Array.from({ length: firstTypes.totalPages - 1 }, (_, index) => getAccessoryTypes({ ...typeParams, page: index + 2 }))),
  ]);
  const accessories = [firstAccessories, ...accessoryPages].flatMap((page) => page.items);
  const types = [firstTypes, ...typePages].flatMap((page) => page.items);
  return {
    total: firstAccessories.totalCount,
    active: active.totalCount,
    typeCount: firstTypes.totalCount,
    assignments: accessories.reduce((sum, item) => sum + item.assignedModelCount, 0),
    distribution: types.map((type) => ({ id: type.id, name: type.typeName, count: type.accessoryCount })).filter((type) => type.count > 0),
  };
}
export const getAccessoryLookup = async () => (await api.get<AccessoryLookup[]>(`${root}/lookup`)).data;
export const getAccessory = async (code: string) => (await api.get<Accessory>(codePath(code))).data;
export const createAccessory = async (payload: AccessoryPayload) => (await api.post<Accessory>(root, payload)).data;
export const updateAccessory = async (code: string, payload: AccessoryPayload) => (await api.put<Accessory>(codePath(code), payload)).data;
export const setAccessoryStatus = async (code: string, isActive: boolean) => (await api.patch<Accessory>(`${codePath(code)}/status`, { isActive })).data;
export const getModelAccessories = async (modelCode: string, includeInactive: boolean) => {
  const data: unknown = (await api.get(modelPath(modelCode), { params: { includeInactive } })).data;
  if (!isModelAccessories(data)) throw new Error("The server returned an invalid accessories response.");
  return data;
};

function isModelAccessories(value: unknown): value is ModelAccessories {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return typeof result.machineModelId === "number" && typeof result.modelCode === "string" && Array.isArray(result.accessories) && result.accessories.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return typeof row.accessoryCode === "string" && typeof row.accessoryName === "string" && typeof row.accessoryTypeName === "string" && typeof row.isActive === "boolean";
  });
}
export const assignAccessory = async (modelCode: string, accessoryCode: string) => (await api.post<ModelAccessory>(modelPath(modelCode), { accessoryCode })).data;
export const setAssignmentStatus = async (modelCode: string, accessoryCode: string, isActive: boolean) => (await api.patch<ModelAccessory>(`${modelPath(modelCode)}/${encodeURIComponent(accessoryCode)}/status`, { isActive })).data;
export const unassignAccessory = async (modelCode: string, accessoryCode: string) => (await api.delete<{ success: boolean; message: string }>(`${modelPath(modelCode)}/${encodeURIComponent(accessoryCode)}`)).data;
export const getAccessoryTypes = async (params: AccessoryTypeSearchRequest) => (await api.get<AccessoryTypePagedResponse>(typeRoot, { params })).data;
export const getAccessoryTypeLookup = async () => (await api.get<AccessoryTypeLookupResponse[]>(`${typeRoot}/lookup`)).data;
export const getAccessoryType = async (code: string) => (await api.get<AccessoryTypeResponse>(typePath(code))).data;
export const createAccessoryType = async (payload: CreateAccessoryTypeRequest) => (await api.post<AccessoryTypeResponse>(typeRoot, payload)).data;
export const updateAccessoryType = async (code: string, payload: UpdateAccessoryTypeRequest) => (await api.put<AccessoryTypeResponse>(typePath(code), payload)).data;
export const setAccessoryTypeStatus = async (code: string, payload: UpdateAccessoryTypeStatusRequest) => (await api.patch<AccessoryTypeResponse>(`${typePath(code)}/status`, payload)).data;
