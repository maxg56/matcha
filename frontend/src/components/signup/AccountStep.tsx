import React from "react";
import type { SignUpFormData } from "@/types/SignUpTypes";

interface AccountStepProps {
    form: SignUpFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AccountStep: React.FC<AccountStepProps> = ({ form, handleChange }) => {
    return (
        <>
            <label className="block mb-2 font-semibold">Username</label>
            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full mb-4"
                placeholder="Username"
            />
            <label className="block mb-2 font-semibold">Email</label>
            <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                placeholder="your@email.com"
            />
        </>
    );
};

export default AccountStep;