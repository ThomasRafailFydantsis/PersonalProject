import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";


const RoleContext = createContext();


export const RoleProvider = ({ children }) => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get("https://localhost:7295/api/account/me", {
                    withCredentials: true,
                });
                setRoles(response.data.Roles || []);
            } catch (error) {
                console.error("Error fetching roles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return (
        <RoleContext.Provider value={{ roles, isLoading }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRoles = () => {
    return useContext(RoleContext);
};