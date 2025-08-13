import React from "react";
import type { SignUpFormData } from "@/types/SignUpTypes";

interface PreferencesStepProps {
    form: SignUpFormData & { bio: string };
    handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ form, handleChange }) => {
    return (
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
    );
};

export default PreferencesStep;
