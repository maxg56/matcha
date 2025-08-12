import React from "react";
import SignUpForm from "@/components/SignUpForm";

interface SignUpData {
	// Replace these fields with the actual fields expected from the sign up form
	username: string;
	email: string;
	password: string;
}

const InscriptionPage: React.FC = () => {
	const handleSignUp = (data: SignUpData) => {
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
