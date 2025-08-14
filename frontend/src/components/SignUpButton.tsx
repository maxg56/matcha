import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SignUpButton: React.FC = () => {
    return (
        <Link to="/InscriptionPage" className="flex items-center">
            <Button variant="outline">Sign Up</Button>
        </Link>
    );
};

export default SignUpButton;
