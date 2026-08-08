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
  INSTALLATIONS: "/installations",
  INSTALLATION_SUMMARY: "/installations/summary",
  CONFIRM_INSTALLATIONS: "/installations/confirm-installations",
  CONFIRM_INSTALLATION_DETAILS: (id: number | string) =>
    `/installations/confirm-installations/${id}`,
  SUBMIT_INSTALLATIONS: "/installations/submit-installations",
} as const;
