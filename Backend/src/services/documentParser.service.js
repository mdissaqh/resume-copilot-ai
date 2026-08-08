import { PDFParse } from "pdf-parse"

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