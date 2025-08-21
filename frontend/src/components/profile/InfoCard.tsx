interface InfoCardProps {
	title: string;
	children: React.ReactNode;
	icon: React.ReactNode;
}

export function InfoCard({ title, children, icon }: InfoCardProps) {
	return (
	<div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-lg">
		<div className="flex items-center gap-2 mb-3">
			{icon}
			<h3 className="font-semibold text-foreground">{title}</h3>
		</div>
		{children}
	</div>
);
}