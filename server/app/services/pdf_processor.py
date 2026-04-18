import fitz
import pdfplumber
import io
from app.core.logger import logger


def extract_text_pymupdf(file_bytes: bytes) -> tuple[str, int]:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n\n".join(pages), len(pages)


def extract_tables_pdfplumber(file_bytes: bytes) -> list[dict]:
    tables = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            for table in page.extract_tables():
                if table and len(table) > 1:
                    tables.append({
                        "page": page_num,
                        "headers": table[0],
                        "rows": table[1:],
                    })
    return tables


def extract_pdf_content(file_bytes: bytes) -> dict:
    try:
        text, page_count = extract_text_pymupdf(file_bytes)
    except Exception as e:
        logger.error("PyMuPDF extraction failed — %s", str(e))
        err = Exception("PDF text extraction failed. The file may be corrupted or image-only.")
        err.status_code = 422
        raise err

    word_count = len(text.split())

    if word_count < 100:
        err = Exception("PDF appears to be image-only or has too little text to analyze.")
        err.status_code = 422
        raise err

    try:
        tables = extract_tables_pdfplumber(file_bytes)
    except Exception as e:
        logger.error("pdfplumber table extraction failed — %s", str(e))
        tables = []

    return {
        "text": text,
        "pageCount": page_count,
        "wordCount": word_count,
        "tables": tables,
    }


def build_user_content(content: dict, plan_tier: str) -> str:
    groq_plans = {"free", "student"}
    text = content["text"]

    if plan_tier in groq_plans:
        # Groq free tier: ~12K TPM. System prompt ≈ 1.5K tokens. Keep text under 8K tokens ≈ 30K chars.
        extracted = _smart_extract(text, 30_000)
    else:
        # OpenAI GPT-4o dev tier: 30K TPM. System prompt ≈ 1.5K + output 8K = 9.5K. Budget: ~20K tokens ≈ 72K chars.
        extracted = _smart_extract(text, 72_000)

    user_content = f"Full paper text:\n\n{extracted}"

    if content["tables"]:
        user_content += f"\n\nExtracted tables ({len(content['tables'])} total):\n"
        for t in content["tables"][:5]:
            user_content += f"Page {t['page']}: {t['headers']}\n"

    return user_content


def _smart_extract(text: str, char_budget: int) -> str:
    if len(text) <= char_budget:
        return text

    # Always include beginning (abstract + intro)
    head = text[:20_000]

    # Always include ending (conclusion + references start)
    tail = text[-4_000:]

    # Fill middle budget with content from the results/methodology area
    middle_budget = char_budget - len(head) - len(tail)
    if middle_budget <= 0:
        return head + "\n\n[...]\n\n" + tail

    # Try to start middle from ~30% into the paper (past intro, into methodology/results)
    middle_start = max(20_000, int(len(text) * 0.28))
    middle_end = min(len(text) - 4_000, middle_start + middle_budget)
    middle = text[middle_start:middle_end]

    return head + "\n\n[...]\n\n" + middle + "\n\n[...]\n\n" + tail
