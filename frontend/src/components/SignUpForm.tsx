import { useState } from "react";

type SignUpFormData = {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	gender: string;
	lookingFor: string;
};

const SignUpForm = ({ onSubmit }: { onSubmit: (data: SignUpFormData) => void }) => {
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		gender: "Women",
		lookingFor: "Women",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = () => {
		if (form.password !== form.confirmPassword) {
			alert("Les mots de passe ne correspondent pas");
			return;
		}
		onSubmit(form);
	};

	return (
		<div>
		<div
			className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md"
			style={{ maxHeight: "90vh", overflowY: "auto" }}
		>
			<div className="mb-6">
				<button
					type="button"
					className="text-blue-600 hover:underline font-semibold"
					onClick={() => window.location.href = "/"}
				>
					Back to Login
				</button>
			</div>
			{/* Username */}
			<div className="flex flex-col">
				<label htmlFor="username" className="font-semibold mb-1">
					Username
				</label>
				<input
					id="username"
					name="username"
					value={form.username}
					onChange={handleChange}
					placeholder="Your username"
					className="rounded border px-3 py-2 w-full"
				/>
			</div>

			{/* First Name */}
			<div className="flex flex-col">
				<label htmlFor="firstName" className="font-semibold mb-1">
					First Name
				</label>
				<input
					id="firstName"
					name="firstName"
					value={form.firstName}
					onChange={handleChange}
					placeholder="Your first name"
					className="rounded border px-3 py-2 w-full"
				/>
			</div>

			{/* Last Name */}
			<div className="flex flex-col">
				<label htmlFor="lastName" className="font-semibold mb-1">
					Last Name
				</label>
				<input
					id="lastName"
					name="lastName"
					value={form.lastName}
					onChange={handleChange}
					placeholder="Your last name"
					className="rounded border px-3 py-2 w-full"
				/>
			</div>

			{/* Gender */}
			<div className="flex flex-col col-span-1 sm:col-span-2">
				<label htmlFor="gender" className="font-semibold mb-1">
					I am a
				</label>
				<select
					id="gender"
					name="gender"
					value={form.gender}
					onChange={handleChange}
					className="rounded border px-3 py-3 w-full text-lg"
				>
					<option value="Women">Women</option>
					<option value="Men">Men</option>
					<option value="Other">Other</option>
				</select>
			</div>

			{/* Looking For */}
			<div className="flex flex-col col-span-1 sm:col-span-2">
				<label htmlFor="lookingFor" className="font-semibold mb-1">
					I want to see
				</label>
				<select
					id="lookingFor"
					name="lookingFor"
					value={form.lookingFor}
					onChange={handleChange}
					className="rounded border px-3 py-3 w-full text-lg"
				>
					<option value="Women">Women</option>
					<option value="Men">Men</option>
					<option value="Both">Both</option>
				</select>
			</div>

			{/* Email on a single line */}
			<div className="flex flex-col mt-4">
				<label htmlFor="email" className="font-semibold mb-1">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					value={form.email}
					onChange={handleChange}
					placeholder="Votre email"
					className="rounded border px-3 py-2 w-full"
				/>
			</div>

			{/* Passwords on the same line */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
				<div className="flex flex-col">
					<label htmlFor="password" className="font-semibold mb-1">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						value={form.password}
						onChange={handleChange}
						placeholder="Votre mot de passe"
						className="rounded border px-3 py-2 w-full"
					/>
				</div>
				<div className="flex flex-col">
					<label htmlFor="confirmPassword" className="font-semibold mb-1">
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						value={form.confirmPassword}
						onChange={handleChange}
						placeholder="Confirmez votre mot de passe"
						className="rounded border px-3 py-2 w-full"
					/>
				</div>
			</div>

			{/* Bouton */}
			<div className="mt-6 flex justify-center">
				<button
					className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
					onClick={handleSubmit}
					type="button"
				>
					S'inscrire
				</button>
			</div>
		</div>
		</div>
	);
};

export default SignUpForm;
