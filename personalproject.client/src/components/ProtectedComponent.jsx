import PropTypes from "prop-types";
import { useRoles } from "./ProtectedRoute";

const ProtectedComponent = ({ allowedRoles, children }) => {
    const { roles, isLoading } = useRoles();

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!allowedRoles.some(role => roles.includes(role))) {
        return (
            <div className="access-denied">
               
                <p>You do not have permission to view this content.</p>
                
            </div>
        );
    }

    return <>{children}</>; 
};


ProtectedComponent.propTypes = {
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.node.isRequired,
};

export default ProtectedComponent;