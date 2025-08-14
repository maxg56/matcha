import React from "react";
import SignUpForm from "@/components/SignUpForm";

interface SignUpData {
	username: string;
	email: string;
	password: string;
}

const InscriptionPage: React.FC = () => {
	const handleSignUp = (data: SignUpData) => {
		console.log("Sign Up Data:", data);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<SignUpForm onSubmit={handleSignUp} />
		</div>
	);
};

export default InscriptionPage;
