import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const SignInButton: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!username || !password) return;
        console.log("Username:", username);
        console.log("Password:", password);
        navigate("/ConversationPage");
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Sign In</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Connexion</SheetTitle>
                    <SheetDescription>
                        Entrez vos identifiants pour vous connecter.
                    </SheetDescription>
                </SheetHeader>
                <form className="grid gap-4 py-4" onSubmit={handleLogin}>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="col-span-3"
                            placeholder="Votre nom d'utilisateur"
                            autoComplete="username"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="col-span-3"
                            placeholder="Votre mot de passe"
                            autoComplete="current-password"
                        />
                    </div>
                    <Button
                        className="w-full"
                        type="submit"
                        disabled={!username || !password}
                    >
                        Se connecter
                    </Button>
                </form>
                <div className="flex justify-end col-span-4">
                    <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Mot de passe oublié ?
                    </a>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SignInButton;
