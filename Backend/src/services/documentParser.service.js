import { PDFParse } from "pdf-parse"
import mammoth from "mammoth"

export const extractTextFromPDF = async (fileBuffer) => {
    try {
        const parser = new PDFParse({ data: fileBuffer });

        const data = await parser.getText();

        console.log(data);

        const cleanText = data.text.replace(/\s+/g, " ").trim();

        console.log(cleanText);

        return cleanText;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to extract text from the PDF document.");
    }
}

export const extractTextFromDOCX = async (fileBuffer) => {
    try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });

        console.log(result);

        const cleanText = result.value.replace(/\s+/g, " ").trim();

        console.log(cleanText);

        return cleanText;
    } catch (error) {
        console.error("DOCX Parsing Error:", error);
        throw new Error("Failed to extract text from the DOCX document.");
    }
}