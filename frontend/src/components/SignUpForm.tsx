import { useState } from "react";

interface SignUpFormData {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	gender: string;
	lookingFor: string;
}

const SignUpFormWizard = ({ onSubmit }: { onSubmit: (data: SignUpFormData & { bio?: string }) => void }) => {
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<SignUpFormData & { bio?: string }>({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		gender: "Women",
		lookingFor: "Women",
		bio: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const nextStep = () => setStep(s => s + 1);
	const prevStep = () => setStep(s => s - 1);

	const checkPassword = (password: string) => {
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]{8,}$/;
		return regex.test(password);
	};

	const handleFinalSubmit = () => {
		if (form.password !== form.confirmPassword) {
			alert("Les mots de passe ne correspondent pas");
			return;
		}
		onSubmit(form);
	};

	const handleSkip = () => {
		if (step === 4) nextStep();
	};

	return (
		<div className="w-full max-w-md mx-auto p-4 bg-white rounded shadow-md">
			{step === 0 && (
				<>
					<label className="block mb-2 font-semibold">First Name</label>
					<input
						name="firstName"
						value={form.firstName}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full mb-4"
					/>
					<label className="block mb-2 font-semibold">Last Name</label>
					<input
						name="lastName"
						value={form.lastName}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
					/>
				</>
			)}

			{step === 1 && (
				<>
					<label className="block mb-2 font-semibold">Username</label>
					<input
						name="username"
						value={form.username}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full mb-4"
					/>
					<label className="block mb-2 font-semibold">Email</label>
					<input
						type="email"
						name="email"
						value={form.email}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
					/>
				</>
			)}

			{step === 2 && (
				<>
					<label className="block mb-2 font-semibold">Password</label>
					<div className="relative mb-2">
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							value={form.password}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(v => !v)}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
							tabIndex={-1}
						>
							{showPassword ? "🙈" : "👁️"}
						</button>
					</div>
					{form.password && !checkPassword(form.password) && (
						<div className="text-red-500 text-sm mb-2">
							Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
						</div>
					)}
					<label className="block mb-2 font-semibold">Confirm Password</label>
					<div className="relative">
						<input
							type={showConfirmPassword ? "text" : "password"}
							name="confirmPassword"
							value={form.confirmPassword}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(v => !v)}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
							tabIndex={-1}
						>
							{showConfirmPassword ? "🙈" : "👁️"}
						</button>
					</div>
					{form.confirmPassword && form.password !== form.confirmPassword && (
						<div className="text-red-500 text-sm mt-2">
							Les mots de passe ne correspondent pas.
						</div>
					)}
				</>
			)}

			{step === 3 && (
				<>
					<label className="block mb-2 font-semibold">I am a</label>
					<select
						name="gender"
						value={form.gender}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full mb-4"
					>
						<option value="Women">Women</option>
						<option value="Men">Men</option>
						<option value="Other">Other</option>
					</select>
					<label className="block mb-2 font-semibold">I want to see</label>
					<select
						name="lookingFor"
						value={form.lookingFor}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full mb-4"
					>
						<option value="Women">Women</option>
						<option value="Men">Men</option>
						<option value="Both">Both</option>
					</select>
				</>
			)}

			{step === 4 && (
				<>
					<label className="block mb-2 font-semibold">Biography (optional)</label>
					<textarea
						name="bio"
						value={form.bio}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
						rows={3}
						placeholder="Tell us about yourself..."
					/>
				</>
			)}

			{/* Étape 5 */}
			{step === 5 && (
				<div className="text-center text-green-600 font-semibold">
					Inscription réussie ! Vous pouvez maintenant vous connecter.
				</div>
			)}
			{/* Boutons navigation */}
			<div className="mt-4 flex justify-between items-center">
				<div>
					{step > 0 && (
						<button
							onClick={prevStep}
							className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
						>
							Précédent
						</button>
					)}
				</div>
				<div className="flex gap-2">
					{step >= 4 && step < 5 && (
						<button
							type="button"
							onClick={handleSkip}
							className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
						>
							Skip
						</button>
					)}
					{step < 5 ? (
						<button
							onClick={nextStep}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							disabled={
								(step === 0 && (!form.firstName || !form.lastName)) ||
								(step === 1 && (!form.username || !form.email)) ||
								(step === 2 && (
									!form.password ||
									!form.confirmPassword ||
									form.password !== form.confirmPassword ||
									!checkPassword(form.password)
								)) ||
								(step === 3 && (!form.gender || !form.lookingFor))
							}
						>
							Suivant
						</button>
					) : (
						<button
							onClick={handleFinalSubmit}
							className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
						>
							Valider
						</button>
					)}
				</div>
			</div>
			{/* Barre de progression */}
			{step < 5 && (
				<div className="flex items-center mt-4">
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full"
							style={{ width: `${((step + 1) / 5) * 100}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default SignUpFormWizard;
