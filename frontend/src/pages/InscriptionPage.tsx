import React from "react";
import SignUpForm from "@/components/SignUpForm";

const InscriptionPage: React.FC = () => {
	const handleSignUp = (data: any) => {
		console.log("Sign Up Data:", data);
		// Here you would typically send the data to your backend
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<SignUpForm onSubmit={handleSignUp} />
		</div>
	);
};

export default InscriptionPage;