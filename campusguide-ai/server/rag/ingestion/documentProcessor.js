import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Document Processor
 * Extracts text from various file formats
 */
class DocumentProcessor {
    constructor() {
        this.supportedFormats = ['.pdf', '.docx', '.txt', '.md'];
    }

    async processFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        if (!this.supportedFormats.includes(ext)) {
            throw new Error(`Unsupported file format: ${ext}`);
        }

        console.log(`📄 Processing: ${path.basename(filePath)}`);

        switch (ext) {
            case '.pdf':
                return await this.processPDF(filePath);
            case '.docx':
                return await this.processDOCX(filePath);
            case '.txt':
            case '.md':
                return await this.processText(filePath);
            default:
                throw new Error(`Handler not implemented for ${ext}`);
        }
    }

    async processPDF(filePath) {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return {
                text: data.text,
                pages: data.numpages,
                metadata: {
                    format: 'pdf',
                    fileName: path.basename(filePath)
                }
            };
        } catch (error) {
            console.error(`Error processing PDF: ${error.message}`);
            throw error;
        }
    }

    async processDOCX(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const result = await mammoth.extractRawText({ buffer });
            return {
                text: result.value,
                metadata: {
                    format: 'docx',
                    fileName: path.basename(filePath)
                }
            };
        } catch (error) {
            console.error(`Error processing DOCX: ${error.message}`);
            throw error;
        }
    }

    async processText(filePath) {
        try {
            const text = await fs.readFile(filePath, 'utf-8');
            return {
                text,
                metadata: {
                    format: path.extname(filePath).slice(1),
                    fileName: path.basename(filePath)
                }
            };
        } catch (error) {
            console.error(`Error processing text file: ${error.message}`);
            throw error;
        }
    }

    chunkText(text, chunkSize = 500, overlap = 50) {
        const chunks = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                // Keep overlap
                const words = currentChunk.split(' ');
                currentChunk = words.slice(-Math.floor(overlap / 5)).join(' ') + ' ' + sentence;
            } else {
                currentChunk += sentence;
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    async processDirectory(dirPath, category) {
        const results = [];
        
        try {
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                
                if (stat.isFile()) {
                    const ext = path.extname(file).toLowerCase();
                    if (this.supportedFormats.includes(ext)) {
                        try {
                            const processed = await this.processFile(filePath);
                            const chunks = this.chunkText(processed.text);
                            
                            results.push({
                                fileName: file,
                                category,
                                chunks,
                                metadata: processed.metadata
                            });
                        } catch (error) {
                            console.error(`Failed to process ${file}:`, error.message);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error.message);
        }
        
        return results;
    }
}

export default DocumentProcessor;
