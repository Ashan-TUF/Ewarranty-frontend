import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignAccessory, createAccessory, getAccessories, getAccessory, getAccessoryLookup, getModelAccessories, setAccessoryStatus, setAssignmentStatus, unassignAccessory, updateAccessory } from "./service";
import type { AccessoryPayload, AccessorySearch } from "./types";

export const accessoryKeys = {
  lists: ["accessories", "list"] as const,
  lookup: ["accessories", "lookup"] as const,
  detail: (code: string) => ["accessories", "detail", code] as const,
  model: (code: string) => ["model-accessories", code] as const,
};

export function useAccessories(search: AccessorySearch) { return useQuery({ queryKey: [...accessoryKeys.lists, search], queryFn: () => getAccessories(search) }); }
export function useAccessoryLookup(enabled = true) { return useQuery({ queryKey: accessoryKeys.lookup, queryFn: getAccessoryLookup, enabled }); }
export function useAccessory(code: string | null) { return useQuery({ queryKey: accessoryKeys.detail(code || ""), queryFn: () => getAccessory(code!), enabled: !!code }); }
export function useModelAccessories(modelCode: string, includeInactive: boolean, enabled = true) { return useQuery({ queryKey: [...accessoryKeys.model(modelCode), includeInactive], queryFn: () => getModelAccessories(modelCode, includeInactive), enabled: enabled && !!modelCode }); }

export function useAccessoryMutations() {
  const client = useQueryClient();
  const refresh = async (code?: string) => {
    await Promise.all([
      client.invalidateQueries({ queryKey: accessoryKeys.lists }),
      client.invalidateQueries({ queryKey: accessoryKeys.lookup }),
      ...(code ? [client.invalidateQueries({ queryKey: accessoryKeys.detail(code) })] : []),
    ]);
  };
  return {
    create: useMutation({ mutationFn: createAccessory, onSuccess: (item) => refresh(item.accessoryCode) }),
    update: useMutation({ mutationFn: ({ code, payload }: { code: string; payload: AccessoryPayload }) => updateAccessory(code, payload), onSuccess: (item) => refresh(item.accessoryCode) }),
    status: useMutation({ mutationFn: ({ code, isActive }: { code: string; isActive: boolean }) => setAccessoryStatus(code, isActive), onSuccess: async (item) => { await refresh(item.accessoryCode); await client.invalidateQueries({ queryKey: ["model-accessories"] }); } }),
  };
}

export function useAssignmentMutations(modelCode: string) {
  const client = useQueryClient();
  const refresh = async () => { await Promise.all([client.invalidateQueries({ queryKey: accessoryKeys.model(modelCode) }), client.invalidateQueries({ queryKey: accessoryKeys.lists })]); };
  return {
    assign: useMutation({ mutationFn: (accessoryCode: string) => assignAccessory(modelCode, accessoryCode), onSuccess: refresh }),
    status: useMutation({ mutationFn: ({ accessoryCode, isActive }: { accessoryCode: string; isActive: boolean }) => setAssignmentStatus(modelCode, accessoryCode, isActive), onSuccess: refresh }),
    unassign: useMutation({ mutationFn: (accessoryCode: string) => unassignAccessory(modelCode, accessoryCode), onSuccess: refresh }),
  };
}
