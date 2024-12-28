import { useState } from "react";
import axios from "axios";

const UserProfileImageUpload = ({ userId }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append("file", image);
        formData.append("userId", userId); // Replace with dynamic user ID

        try {
            const response = await axios.put(
                "https://localhost:7295/api/ImageUpload/upload/user-profile",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            alert("Image uploaded successfully!");
            console.log("Uploaded Path:", response.data.Path);
        } catch (error) {
            console.error("Error uploading image:", error.response?.data || error.message);
            alert("Failed to upload image.");
        }
    };
    return (
        <div>
            <h3>Upload Profile Image</h3>
            <input type="file" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: "100px", height: "100px" }} />}
            <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default UserProfileImageUpload;