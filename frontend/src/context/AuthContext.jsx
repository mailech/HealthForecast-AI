import {
    createContext,
    useContext,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(
        JSON.parse(
            localStorage.getItem("user")
        ) || null
    );


    const login = async (
        email,
        password,
        role
    ) => {

        const response = await api.post(
            "/auth/login",
            {
                email,
                password,
                role
            }
        );

        const data = response.data;


        if (data.success) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setUser(data.user);

        }

        return data;
    };


    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () =>
    useContext(AuthContext);