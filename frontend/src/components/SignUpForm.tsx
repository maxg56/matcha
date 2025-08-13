import React, { useState } from "react";
import { ArrowBigLeftDash, Check } from "lucide-react";
import type { SignUpFormData } from "@/types/SignUpTypes";
import PersonalInfoStep from "./signup/PersonalInfoStep";
import AccountStep from "./signup/AccountStep";
import PasswordStep from "./signup/PasswordStep";
import PreferencesStep from "./signup/PreferencesStep";
import BiographyStep from "./signup/BiographyStep";
import PhotosStep from "./signup/PhotosStep";

const SignUpFormWizard = ({ onSubmit }: { onSubmit: (data: SignUpFormData & { bio?: string }) => void }) => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<SignUpFormData & { bio: string }>({
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
    const [photos, setPhotos] = useState<File[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const checkPassword = (password: string) => {
        // Password must contain at least one lowercase, one uppercase, one digit, one special character, and be at least 8 characters long
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?`~]{8,}$/;
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
        if (step >= 4 && step < 6) nextStep();
    };

    const canGoNext = !(
        (step === 0 && (!form.firstName || !form.lastName)) ||
        (step === 1 && (!form.username || !form.email)) ||
        (step === 2 && (
            !form.password ||
            !form.confirmPassword ||
            form.password !== form.confirmPassword ||
            !checkPassword(form.password)
        )) ||
        (step === 3 && (!form.gender || !form.lookingFor)) ||
        (step === 4 && !form.bio.trim()) ||
        (step === 5 && photos.length === 0)
    );

    const renderStep = () => {
        switch (step) {
            case 0:
                return <PersonalInfoStep form={form} handleChange={handleChange} />;
            case 1:
                return <AccountStep form={form} handleChange={handleChange} />;
            case 2:
                return (
                    <PasswordStep
                        form={form}
                        handleChange={handleChange}
                        showPassword={showPassword}
                        showConfirmPassword={showConfirmPassword}
                        setShowPassword={setShowPassword}
                        setShowConfirmPassword={setShowConfirmPassword}
                        checkPassword={checkPassword}
                    />
                );
            case 3:
                return <PreferencesStep form={form} handleChange={handleChange} />;
            case 4:
                return <BiographyStep form={form} handleChange={handleChange} />;
            case 5:
                return <PhotosStep photos={photos} setPhotos={setPhotos} />;
            case 6:
                return (
                    <div className="text-center text-green-600 font-semibold">
                        Inscription réussie ! Vous pouvez maintenant vous connecter.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded shadow-md">
            {renderStep()}

            <div className="mt-4 flex flex-col gap-4">
                <div className="flex gap-10 justify-between items-center">
                    <div>
                        {step > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
                            >
                                <ArrowBigLeftDash className="inline mr-1" />
                            </button>
                        )}
                    </div>
                    <div className="ml-auto">
                        {step < 6 ? (
                            canGoNext ? (
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    <Check className="inline mr-1" />
                                </button>
                            ) : (
                                step >= 4 && step < 6 && (
                                    <button
                                        onClick={handleSkip}
                                        className="px-4 py-2 bg-amber-300 rounded hover:bg-amber-500"
                                    >
                                        Skip
                                    </button>
                                )
                            )
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
                <div className="mt-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${((step + 1) / 7) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SignUpFormWizard;
