import React from "react";
import type { SignUpFormData } from "@/types/SignUpTypes";

interface PersonalInfoStepProps {
    form: SignUpFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ form, handleChange }) => {
    return (
        <>
            <label className="block mb-2 font-semibold">First Name</label>
            <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full mb-4"
                placeholder="First Name"
            />
            <label className="block mb-2 font-semibold">Last Name</label>
            <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                placeholder="Last Name"
            />
        </>
    );
};

export default PersonalInfoStep;
