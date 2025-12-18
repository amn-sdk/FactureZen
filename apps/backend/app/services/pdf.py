import httpx
from typing import Optional

class PdfService:
    def __init__(self, gotenberg_url: str = "http://localhost:3001"):
        self.url = gotenberg_url

    async def convert_docx_to_pdf(self, docx_content: bytes) -> bytes:
        """
        Sends a DOCX file to Gotenberg and returns the converted PDF bytes.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            files = {
                "files": ("document.docx", docx_content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            }
            # Gotenberg 8 endpoint for LibreOffice conversion
            response = await client.post(
                f"{self.url}/forms/libreoffice/convert",
                files=files
            )
            
            if response.status_code != 200:
                raise Exception(f"PDF conversion failed: {response.text}")
            
            return response.content

pdf_service = PdfService()
