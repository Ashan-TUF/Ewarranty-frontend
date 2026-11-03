export interface Accessory { id: number; accessoryCode: string; accessoryName: string; description: string | null; isActive: boolean; createdAt: string; updatedAt: string | null }
export interface AccessoryListItem extends Accessory { assignedModelCount: number }
export interface AccessoryPage { items: AccessoryListItem[]; page: number; pageSize: number; totalCount: number; totalPages: number }
export interface AccessoryLookup { id: number; accessoryCode: string; accessoryName: string }
export interface ModelAccessory { id: number; machineModelId: number; accessoryId: number; accessoryCode: string; accessoryName: string; description: string | null; isActive: boolean; createdAt: string; updatedAt: string | null }
export interface ModelAccessories { machineModelId: number; modelCode: string; accessories: ModelAccessory[] }
export interface AccessorySearch { search: string; isActive?: boolean; sortBy: string; sortDirection: "asc" | "desc"; page: number; pageSize: number }
export interface AccessoryPayload { accessoryName: string; description: string | null }
