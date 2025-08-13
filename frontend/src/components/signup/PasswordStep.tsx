import React from "react";
import type { SignUpFormData } from "@/types/SignUpTypes";

interface PasswordStepProps {
    form: SignUpFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    showConfirmPassword: boolean;
    setShowPassword: (show: boolean) => void;
    setShowConfirmPassword: (show: boolean) => void;
    checkPassword: (password: string) => boolean;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
    form,
    handleChange,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    checkPassword
}) => {
    return (
        <>
            <label className="block mb-2 font-semibold">Password</label>
            <div className="relative mb-2">
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full pr-10"
                    placeholder="Your Password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>
            {form.password && !checkPassword(form.password) && (
                <div className="text-red-500 text-sm mb-2">
                    The password must contain at least 8 characters, one uppercase, lowercase, number and special character.
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
                    placeholder="Confirm Password"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                >
                    {showConfirmPassword ? "🙈" : "👁️"}
                </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="text-red-500 text-sm mt-2">
                    The passwords do not match.
                </div>
            )}
        </>
    );
};

export default PasswordStep;