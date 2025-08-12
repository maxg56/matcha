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

const SignInButton: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log("Username:", username);
        console.log("Password:", password);
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
                <div className="grid gap-4 py-4">
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
                        />
                    </div>
                    <Button onClick={handleLogin} className="w-full">
                        Se connecter
                    </Button>
                </div>
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
