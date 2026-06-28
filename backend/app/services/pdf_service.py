import io
import tempfile
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text and len(page_text.strip()) > 30:
                text_parts.append(page_text)
            else:
                # Fallback: OCR for scanned pages
                try:
                    import pytesseract
                    img = page.to_image(resolution=300).original
                    buf = io.BytesIO()
                    img.save(buf, format="PNG")
                    ocr_text = pytesseract.image_to_string(
                        io.BytesIO(buf.getvalue()), lang="eng+ara"
                    ).strip()
                    if ocr_text:
                        text_parts.append(ocr_text)
                except Exception:
                    pass
    return "\n\n".join(text_parts)


def generate_pdf(content: str, title: str) -> str:
    try:
        import pdfkit
        html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; font-size: 12pt; }}
    h1 {{ font-size: 16pt; margin-bottom: 24px; }}
    pre {{ white-space: pre-wrap; word-wrap: break-word; }}
  </style>
</head>
<body>
  <h1>{title}</h1>
  <pre>{content}</pre>
</body>
</html>"""
        tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        pdfkit.from_string(html, tmp.name)
        return tmp.name
    except Exception:
        tmp = tempfile.NamedTemporaryFile(suffix=".txt", delete=False, mode="w", encoding="utf-8")
        tmp.write(f"{title}\n{'=' * len(title)}\n\n{content}")
        tmp.close()
        return tmp.name
