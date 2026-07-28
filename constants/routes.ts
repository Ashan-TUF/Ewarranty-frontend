export const ROUTES = {
  ROOT: "/",

  LOGIN: "/login",

  DASHBOARD: "/dashboard",

  MACHINES: "/machines",
  MACHINE_CREATE: "/machines/create",
  MACHINE_DETAILS: (machineCode: string) => `/machines/${machineCode}`,
  MACHINE_MODEL_DETAILS: (machineCode: string, modelCode: string) =>
    `/machines/${machineCode}/models/${modelCode}`,
  MACHINE_MODEL_WARRANTY_DETAILS: (
    machineCode: string,
    modelCode: string,
    warrantyTypeCode: string
  ) => `/machines/${machineCode}/models/${modelCode}/warranties/${warrantyTypeCode}`,

  MACHINE_MODELS: "/machine-models",

  WARRANTIES: "/warranties",

  INSTALLATIONS: "/installations",

  CUSTOMERS: "/customers",
} as const;