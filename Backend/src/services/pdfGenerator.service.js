import puppeteer from 'puppeteer';

/**
 * Renders HTML content in headless Chromium and prints an A4 vector PDF.
 * Ensures selectable text, clickable links, exact A4 dimensions (210mm x 297mm),
 * and zero layout shift.
 */
export const generatePdfFromHtml = async (htmlContent) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none'
            ]
        });

        const page = await browser.newPage();

        // Set A4 viewport
        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 2
        });

        // Set HTML content and wait for network idle
        await page.setContent(htmlContent, {
            waitUntil: ['domcontentloaded', 'networkidle0']
        });

        // Generate A4 PDF Buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            preferCSSPageSize: true
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Puppeteer PDF Generation Error:", error);
        throw new Error("Failed to generate PDF document via server-side Chromium.");
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }
};
