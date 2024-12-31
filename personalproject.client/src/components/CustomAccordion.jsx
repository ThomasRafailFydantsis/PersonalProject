import React, { useState } from "react";

const CustomAccordionItem = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => setIsOpen(!isOpen);

    return (
        <div className="custom-accordion-item">
            <div
                className="custom-accordion-header"
                onClick={toggleAccordion}
                style={{
                    cursor: "pointer",
                    background: "#f8f9fa",
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <h5>{title}</h5>
            </div>
            <div
                className="custom-accordion-body"
                style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease-in-out",
                    padding: isOpen ? "10px" : "0px",
                    background: "#fff",
                    border: isOpen ? "1px solid #ddd" : "none",
                    borderTop: "none",
                }}
            >
                {isOpen && <p>{content}</p>}
            </div>
        </div>
    );
};

const CustomAccordion = ({ items }) => {
    return (
        <div className="custom-accordion">
            {items.map((item, index) => (
                <CustomAccordionItem
                    key={index}
                    title={item.title}
                    content={item.content}
                />
            ))}
        </div>
    );
};

export default CustomAccordion;