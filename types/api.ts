export interface ApiResponse<TData> {
	data: TData;
	success: boolean;
	statusCode: number;
	message: string;
}
