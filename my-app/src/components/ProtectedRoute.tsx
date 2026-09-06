import { useEffect, useState } from "react";
import { checkAuth } from "../services/APIuser";

type Props = {
    children: React.ReactNode;
};

function ProtectedRoute({ children }: Props) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkUser() {
            const result = await checkAuth();
            setIsAuthenticated(result);
        }

        checkUser();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = "http://localhost:5000/login";
        return null;
    }

    return <>{children}</>;
}

export default ProtectedRoute;