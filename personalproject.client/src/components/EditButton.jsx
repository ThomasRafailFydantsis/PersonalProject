import { useState } from 'react';
import certsService from '/MVC/PersonalProject/personalproject.client/CertsService';

function EditButton({ cert, onUpdate }) {
    const [editedCert, setEditedCert] = useState({ ...cert });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedCert((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const updatedCert = await certsService.updateCert(editedCert.certId, editedCert);
            onUpdate(updatedCert); 
        } catch (error) {
            console.error("Error updating certificate:", error);
        }
        console.log("Certificate updated successfully!");
    };

    return (
        <div>
            <form >
            <input
                type="text"
                name="certName"
                value={editedCert.certName}
                onChange={handleChange}
                placeholder="Certificate Name"
            />
            <input
                type="text"
                name="key"
                value={editedCert.key}
                onChange={handleChange}
                placeholder="Key"
            />
            <button onClick={handleSave}>Save</button>    
            </form>
        </div>
    );
}

export default EditButton;