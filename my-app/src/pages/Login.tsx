import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/");
        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                    "Login failed. Please check your email and password."
                );
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="loginPage">
            <form className="loginForm" onSubmit={handleSubmit}>
                <h1>Login</h1>

                {error && <p className="errorMessage">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default Login;