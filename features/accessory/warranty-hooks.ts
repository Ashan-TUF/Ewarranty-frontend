import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accessoryKeys } from "./hooks";
import { createWarranty, createWarrantyType, getAccessoryWarranty, getWarranties, getWarrantyTypeOptions, getWarranty, setWarrantyStatus, updateWarranty } from "./warranty";
import type { WarrantyPayload, WarrantySearch } from "./warranty";

export const warrantyKeys = { lists: ["accessory-warranties", "list"] as const, detail: (id: number) => ["accessory-warranties", "detail", id] as const, accessory: (code: string) => ["accessory-warranties", "accessory", code] as const };
export const useWarranties = (params: WarrantySearch) => useQuery({ queryKey: [...warrantyKeys.lists, params], queryFn: () => getWarranties(params), placeholderData: (previous) => previous });
export const useWarranty = (id: number | null) => useQuery({ queryKey: warrantyKeys.detail(id ?? 0), queryFn: () => getWarranty(id!), enabled: id !== null });
export const useAccessoryWarranty = (code: string | null) => useQuery({ queryKey: warrantyKeys.accessory(code ?? ""), queryFn: () => getAccessoryWarranty(code!), enabled: !!code, retry: (count, error: { response?: { status?: number } }) => error?.response?.status !== 404 && count < 2 });
export const warrantyTypeKeys = { list: ["accessory-warranty-types"] as const };
export const useWarrantyTypes = () => useQuery({ queryKey: warrantyTypeKeys.list, queryFn: getWarrantyTypeOptions });
export function useCreateAccessoryWarrantyType() {
  const client = useQueryClient();
  return useMutation({ mutationFn: createWarrantyType, onSuccess: async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: warrantyTypeKeys.list }),
      client.invalidateQueries({ queryKey: ["warranty-types"] }),
    ]);
  } });
}
export const useWarrantyIndicators = (enabled = true) => useQuery({ queryKey: ["accessory-warranties", "indicators"], enabled, queryFn: async () => {
  const params: WarrantySearch = { search: "", sortBy: "createdAt", sortDirection: "desc", page: 1, pageSize: 100 };
  const first = await getWarranties(params);
  const rest = await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) => getWarranties({ ...params, page: index + 2 })));
  return new Map([first, ...rest].flatMap((page) => page.items).map((item) => [item.accessoryCode, item]));
}, staleTime: 60_000 });
export function useWarrantyMutations() {
  const client = useQueryClient();
  const refresh = async (code?: string, id?: number) => Promise.all([
    client.invalidateQueries({ queryKey: warrantyKeys.lists }),
    client.invalidateQueries({ queryKey: ["accessory-warranties", "indicators"] }),
    client.invalidateQueries({ queryKey: accessoryKeys.lists }),
    ...(code ? [client.invalidateQueries({ queryKey: warrantyKeys.accessory(code) }), client.invalidateQueries({ queryKey: accessoryKeys.detail(code) })] : []),
    ...(id ? [client.invalidateQueries({ queryKey: warrantyKeys.detail(id) })] : []),
  ]);
  return {
    create: useMutation({ mutationFn: createWarranty, onSuccess: (item) => refresh(item.accessoryCode, item.id) }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: WarrantyPayload }) => updateWarranty(id, payload), onSuccess: (item) => refresh(item.accessoryCode, item.id) }),
    status: useMutation({ mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => setWarrantyStatus(id, isActive), onSuccess: (item) => refresh(item.accessoryCode, item.id) }),
  };
}
