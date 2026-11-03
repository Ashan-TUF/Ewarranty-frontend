import { AxiosError } from "axios";
import api from "@/lib/axios";
import type { Accessory, AccessoryLookup, AccessoryPage, AccessoryPayload, AccessorySearch, ModelAccessories, ModelAccessory } from "./types";

const root = "/Accessory";
const codePath = (code: string) => `${root}/${encodeURIComponent(code)}`;
const modelPath = (code: string) => `${root}/models/${encodeURIComponent(code)}`;

export function accessoryError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstValidation = data?.errors && Object.values(data.errors).flat()[0];
    return firstValidation || data?.message || "Accessory request failed.";
  }
  return error instanceof Error ? error.message : "Accessory request failed.";
}

export const getAccessories = async (params: AccessorySearch) => (await api.get<AccessoryPage>(root, { params })).data;
export const getAccessoryLookup = async () => (await api.get<AccessoryLookup[]>(`${root}/lookup`)).data;
export const getAccessory = async (code: string) => (await api.get<Accessory>(codePath(code))).data;
export const createAccessory = async (payload: AccessoryPayload) => (await api.post<Accessory>(root, payload)).data;
export const updateAccessory = async (code: string, payload: AccessoryPayload) => (await api.put<Accessory>(codePath(code), payload)).data;
export const setAccessoryStatus = async (code: string, isActive: boolean) => (await api.patch<Accessory>(`${codePath(code)}/status`, { isActive })).data;
export const getModelAccessories = async (modelCode: string, includeInactive: boolean) => (await api.get<ModelAccessories>(modelPath(modelCode), { params: { includeInactive } })).data;
export const assignAccessory = async (modelCode: string, accessoryCode: string) => (await api.post<ModelAccessory>(modelPath(modelCode), { accessoryCode })).data;
export const setAssignmentStatus = async (modelCode: string, accessoryCode: string, isActive: boolean) => (await api.patch<ModelAccessory>(`${modelPath(modelCode)}/${encodeURIComponent(accessoryCode)}/status`, { isActive })).data;
export const unassignAccessory = async (modelCode: string, accessoryCode: string) => (await api.delete<{ success: boolean; message: string }>(`${modelPath(modelCode)}/${encodeURIComponent(accessoryCode)}`)).data;
