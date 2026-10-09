import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, Link as LinkIcon } from "lucide-react";
import "./ImageDropZone.css";
import { getImageUrl } from "../../utils/imageUrl";
const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
    return new Promise((resolve) => {
        if (file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result || "");
            reader.readAsDataURL(file);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                }
                else {
                    resolve(e.target?.result || "");
                }
            };
            img.onerror = () => resolve(e.target?.result || "");
            img.src = e.target?.result;
        };
        reader.readAsDataURL(file);
    });
};
const ImageDropZone = ({ label, value, onChange, optional = false, placeholder = "Drag & drop image here or click to browse" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef(null);
    const handleFile = async (file) => {
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }
        try {
            const compressedBase64 = await compressImage(file);
            onChange(compressedBase64);
        }
        catch (err) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onChange(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };
    const handleRemove = (e) => {
        e.stopPropagation();
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    return (<div className="image-dropzone-wrapper">
            <div className="image-dropzone-header">
                <label className="image-dropzone-label">
                    {label} {optional && <span className="optional-tag">&lt;optional&gt;</span>}
                </label>
                <button type="button" className="url-toggle-btn" onClick={() => setShowUrlInput(!showUrlInput)} title={showUrlInput ? "Switch to Drag & Drop" : "Paste Image URL directly"}>
                    <LinkIcon size={13}/>
                    {showUrlInput ? "Drag & Drop" : "Paste URL"}
                </button>
            </div>

            {showUrlInput ? (<div className="url-input-container">
                    <input type="url" className="input url-input" placeholder="https://example.com/image.jpg" value={value} onChange={(e) => onChange(e.target.value)}/>
                    {value && (<div className="url-preview-mini">
                            <img src={getImageUrl(value)} alt="Preview" onError={(e) => (e.currentTarget.style.display = "none")}/>
                        </div>)}
                </div>) : (<div className={`image-dropzone-box ${isDragging ? "dragging" : ""} ${value ? "has-image" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => !value && fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }}/>

                    {value ? (<div className="image-preview-container">
                            <img src={getImageUrl(value)} alt={label} className="image-preview"/>
                            <div className="image-preview-overlay">
                                <button type="button" className="preview-btn replace-btn" onClick={() => fileInputRef.current?.click()}>
                                    <UploadCloud size={16}/>
                                    Replace
                                </button>
                                <button type="button" className="preview-btn remove-btn" onClick={handleRemove}>
                                    <Trash2 size={16}/>
                                    Remove
                                </button>
                            </div>
                        </div>) : (<div className="dropzone-prompt">
                            <div className="dropzone-icon">
                                {isDragging ? <UploadCloud size={24}/> : <ImageIcon size={24}/>}
                            </div>
                            <span className="dropzone-text">
                                {isDragging ? "Drop image file here" : placeholder}
                            </span>
                            <span className="dropzone-subtext">Supports PNG, JPG, WEBP, SVG</span>
                        </div>)}
                </div>)}
        </div>);
};
export default ImageDropZone;
