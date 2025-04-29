"use client"

import type React from "react"

import { useState, useRef } from "react"
import "@/styles/image-converter.css"

// Supported image formats
const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageConverter() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [base64String, setBase64String] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length) {
      handleFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Reset states
    setError(null)
    setBase64String(null)
    setCopied(false)

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(`Unsupported file type. Please upload a JPG, PNG, GIF, or WebP image.`)
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is 5MB.`)
      return
    }

    setImage(file)

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Convert to base64
    convertToBase64(file)
  }

  const convertToBase64 = (file: File) => {
    setLoading(true)
    setProgress(0)

    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100)
        setProgress(percentLoaded)
      }
    }

    reader.onload = () => {
      const result = reader.result as string
      // Keep the full data URI including the prefix
      setBase64String(result)
      setLoading(false)
      setProgress(100)
    }

    reader.onerror = () => {
      setError("An error occurred while reading the file.")
      setLoading(false)
    }

    reader.readAsDataURL(file)
  }

  const copyToClipboard = () => {
    if (!base64String || !textareaRef.current) return

    textareaRef.current.select()
    navigator.clipboard
      .writeText(base64String)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        setError("Failed to copy to clipboard. Please try again.")
      })
  }

  const clearImage = () => {
    setImage(null)
    setPreview(null)
    setBase64String(null)
    setError(null)
    setProgress(0)
    setCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="converter-container">
      {/* Instructions */}
      <div className="card instructions">
        <h2>How to use:</h2>
        <ol>
          <li>Upload an image by dragging and dropping or using the file picker</li>
          <li>Wait for the conversion to complete</li>
          <li>Preview your image and check the base64 output</li>
          <li>Click the "Copy to Clipboard" button to copy the base64 string</li>
          <li>Use the complete data URI (including the prefix) in your projects</li>
        </ol>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="alert-icon"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Upload area */}
      <div
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload image"
      >
        <div className="upload-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="upload-icon"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div>
            <p className="upload-text">Drag and drop your image here, or click to browse</p>
            <p className="upload-subtext">Supports JPG, PNG, GIF, and WebP (max 5MB)</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden-input"
          onChange={handleFileChange}
          aria-label="Upload image"
        />
      </div>

      {/* Loading progress */}
      {loading && (
        <div className="progress-container">
          <div className="progress-info">
            <span>Converting...</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Results section */}
      {preview && (
        <div className="results-container">
          {/* Image preview */}
          <div className="card preview-card">
            <div className="card-header">
              <h3>Image Preview</h3>
              <button className="icon-button" onClick={clearImage} aria-label="Clear image">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="image-preview">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="preview-image" />
            </div>
            <div className="image-info">
              <p>
                <strong>File name:</strong> {image?.name}
              </p>
              <p>
                <strong>File size:</strong> {image ? `${(image.size / 1024).toFixed(2)} KB` : ""}
              </p>
              <p>
                <strong>File type:</strong> {image?.type}
              </p>
            </div>
          </div>

          {/* Base64 output */}
          <div className="card output-card">
            <h3>Data URI Output</h3>
            {base64String ? (
              <>
                <div className="textarea-container">
                  <textarea ref={textareaRef} value={base64String} readOnly className="output-textarea"></textarea>
                </div>
                <button onClick={copyToClipboard} className={`copy-button ${copied ? "copied" : ""}`} disabled={copied}>
                  {copied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="button-icon"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="button-icon"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="waiting-container">
                <div className="waiting-content">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="waiting-icon"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <p>Waiting for conversion to complete...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
