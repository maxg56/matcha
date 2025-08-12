import React from "react";
import SignInButton from "../components/ui/SignInButton";
import SignUpButton from "@/components/SignUpButton";

const Accueil: React.FC = () => {
	return (
	<div>
		<header className="flex justify-end items-center p-4 gap-12 relative z-10">
			<SignInButton />
			<SignUpButton />
		</header>
		<div className="fixed inset-0 -z-10">
			<img
				src="/public/MatchaLogo2.png"
				alt="Accueil"
				className="w-full h-full object-cover"
			/>
		</div>
	</div>
);
};

export default Accueil;
