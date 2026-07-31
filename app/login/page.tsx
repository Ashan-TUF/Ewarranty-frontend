import AppFooter from "@/components/layout/AppFooter";

export default function LoginPage() {
	return (
		<div className="flex h-svh flex-col overflow-hidden">
			<div className="flex-1 overflow-y-auto p-6">
				<h1 className="text-2xl font-bold">Login</h1>
			</div>

			<AppFooter />
		</div>
	);
}
