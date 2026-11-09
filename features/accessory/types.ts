export interface Accessory { id: number; accessoryCode: string; accessoryName: string; accessoryTypeId: number; accessoryTypeCode: string; accessoryTypeName: string; description: string | null; isActive: boolean; createdAt: string; updatedAt: string | null }
export interface AccessoryListItem extends Accessory { assignedModelCount: number }
export interface AccessoryPage { items: AccessoryListItem[]; page: number; pageSize: number; totalCount: number; totalPages: number }
export interface AccessoryLookup { id: number; accessoryCode: string; accessoryName: string; accessoryTypeId: number; accessoryTypeCode: string; accessoryTypeName: string }
export interface ModelAccessory { id: number; machineModelId: number; accessoryId: number; accessoryCode: string; accessoryName: string; accessoryTypeId: number; accessoryTypeCode: string; accessoryTypeName: string; description: string | null; isActive: boolean; createdAt: string; updatedAt: string | null }
export interface ModelAccessories { machineModelId: number; modelCode: string; accessories: ModelAccessory[] }
export interface AccessorySearch { search: string; isActive?: boolean; accessoryTypeId?: number; sortBy: string; sortDirection: "asc" | "desc"; page: number; pageSize: number }
export interface AccessoryPayload { accessoryName: string; accessoryTypeId: number; description: string | null }

export interface CreateAccessoryTypeRequest { typeName: string; description: string | null }
export type UpdateAccessoryTypeRequest = CreateAccessoryTypeRequest;
export interface UpdateAccessoryTypeStatusRequest { isActive: boolean }
export interface AccessoryTypeSearchRequest { search: string; isActive?: boolean; sortBy: "id" | "typeCode" | "typeName" | "accessoryCount" | "createdAt" | "updatedAt"; sortDirection: "asc" | "desc"; page: number; pageSize: number }
export interface AccessoryTypeResponse { id: number; typeCode: string; typeName: string; description: string | null; accessoryCount: number; isActive: boolean; createdAt: string; updatedAt: string | null }
export interface AccessoryTypeLookupResponse { id: number; typeCode: string; typeName: string }
export interface AccessoryTypePagedResponse { items: AccessoryTypeResponse[]; page: number; pageSize: number; totalCount: number; totalPages: number }
