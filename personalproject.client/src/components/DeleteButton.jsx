import certsService from '/MVC/PersonalProject/personalproject.client/CertsService';
//import ProtectedComponent from './ProtectedComponent';

function DeleteButton({ certId, onDelete }) {
    const handleDelete = async () => {
        try {
            await certsService.deleteCert(certId);
            onDelete(certId);
        } catch (error) {
            console.error("Error deleting certificate:", error);
        }
    };

    return (
    
            <button  onClick={handleDelete}>Delete</button>
     
    );

}

export default DeleteButton;