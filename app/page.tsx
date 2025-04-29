import { ImageConverter } from "@/components/image-converter"
import "@/styles/globals.css"

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <h1>Image to Base64 Converter</h1>
        <p>
          Convert your images to base64 strings for use in CSS, HTML, or data URIs. Simply drag and drop your image or
          use the file picker below.
        </p>
      </div>

      <ImageConverter />
    </main>
  )
}
