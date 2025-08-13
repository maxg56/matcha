import React from "react";
import type { SignUpFormData } from "@/types/SignUpTypes";

interface BiographyStepProps {
    form: SignUpFormData & { bio: string };
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const BiographyStep: React.FC<BiographyStepProps> = ({ form, handleChange }) => {
    return (
        <>
            <label className="block mb-2 font-semibold">Biography (optional)</label>
            <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                rows={3}
                placeholder="Tell us about yourself..."
                maxLength={400}
            />
            <div className="text-sm text-gray-500 text-right mb-2">
                {form.bio.length}/400 characters
            </div>
        </>
    );
};

export default BiographyStep;