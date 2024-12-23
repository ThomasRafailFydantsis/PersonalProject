import { useState } from "react";
import axios from "axios";

const ExamImageUpload = ({ certId }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!image || !certId) return;

        const formData = new FormData();
        formData.append("file", image);
        formData.append("certId", certId);

        try {
            await axios.put("https://localhost:7295/api/ImageUpload/upload/exam", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        }
    };

    return (
        <div>
            <h3>Upload Exam Image</h3>
            <input type="file" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: "100px", height: "100px" }} />}
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default ExamImageUpload;