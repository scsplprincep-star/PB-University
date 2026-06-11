import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'img_to_excel_session';

const Convert_Img_to_Excel = () => {
    const [images, setImages] = useState([]);
    const [extractedData, setExtractedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(-1);
    const [isDragging, setIsDragging] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [error, setError] = useState('');
    const [showRawText, setShowRawText] = useState({});
    const [resumeSession, setResumeSession] = useState(null);
    const fileInputRef = useRef(null);
    const processingRef = useRef(false);

    const [apiKey, setApiKey] = useState(() => {
        return localStorage.getItem('gemini_api_key') || 'AQ.Ab8RN6KjTOvlFOlZZ1bxynZG5EG2HTm5ghdDeVHFfUFIw8JOrg';
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const WORKING_MODELS = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    // ── Check for incomplete session on mount ──
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const session = JSON.parse(saved);
                if (session && session.imageNames && session.results) {
                    const completed = session.results.filter(r => r !== null).length;
                    const total = session.imageNames.length;
                    if (completed > 0 && completed < total) {
                        setResumeSession(session);
                    } else if (completed >= total) {
                        // All done, restore results and clear session
                        setExtractedData(session.results.filter(r => r !== null));
                        localStorage.removeItem(STORAGE_KEY);
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to restore session:', e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // ── Save session to localStorage ──
    const saveSession = useCallback((imageNames, results, currentIdx) => {
        try {
            const session = {
                imageNames,
                results,
                currentIndex: currentIdx,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch (e) {
            console.error('Failed to save session:', e);
        }
    }, []);

    // ── Clear session ──
    const clearSession = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setResumeSession(null);
    }, []);

    // ── Dismiss resume and start fresh ──
    const dismissResume = () => {
        clearSession();
        setExtractedData([]);
    };

    // ── Restore completed results from resume session ──
    const restoreAndContinue = () => {
        if (!resumeSession) return;
        const completedResults = resumeSession.results.filter(r => r !== null);
        setExtractedData(completedResults);
        setResumeSession(null);
        // User needs to re-upload remaining images
    };

    // Handle multiple image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 20) {
            setError('You can only upload up to 20 images at a time. Only the first 20 images have been loaded.');
            setImages(imageFiles.slice(0, 20));
        } else {
            setImages(imageFiles);
            setError('');
        }
        setExtractedData([]);
    };

    // Remove single image
    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setExtractedData([]);
        setError('');
    };

    // Trigger file select dialog
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                if (imageFiles.length > 20) {
                    setError('You can only upload up to 20 images at a time. Only the first 20 images have been loaded.');
                    setImages(imageFiles.slice(0, 20));
                } else {
                    setImages(imageFiles);
                    setError('');
                }
                setExtractedData([]);
            }
        }
    };

    // Helper: Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // ── Extract structured data from image using Gemini AI (DYNAMIC HEADERS) ──
    const extractStructuredDataFromImage = async (imageFile) => {
        let lastError = null;

        for (const modelName of WORKING_MODELS) {
            try {
                console.log(`Trying model: ${modelName}`);

                const ai = new GoogleGenAI({ apiKey: apiKey });

                const imageBase64 = await fileToBase64(imageFile);

                const prompt = `You are an expert OCR and data extraction AI. Analyze this image carefully and extract ALL text and structured data.

CRITICAL INSTRUCTIONS:
1. DETECT all column headings/headers that appear in the image. Do NOT assume fixed headers — read them from the image exactly as written.
2. Extract EVERY row of data under those headers.
3. For numbers (like roll numbers, enrollment numbers), extract the COMPLETE FULL number. Do NOT truncate or shorten any digits. If a roll number is "268080004", extract all 9 digits exactly.
4. For marks or scores, extract the exact number shown.
5. For text fields (like marks in words), extract them as written.

RESPONSE FORMAT — Return ONLY valid JSON, nothing else:
{
  "headers": ["Header 1", "Header 2", "Header 3", ...],
  "rows": [
    ["value1", "value2", "value3", ...],
    ["value1", "value2", "value3", ...],
    ...
  ]
}

Rules:
- "headers" must be an array of strings — the exact column headings from the image
- "rows" must be an array of arrays — each sub-array is one data row with values matching the headers in order
- If a cell is empty or unreadable, use an empty string ""
- Do NOT add any markdown, code fences, explanations, or extra text — return ONLY the JSON object
- Extract ALL rows, do not skip any
- Preserve the FULL length of all numbers — never abbreviate`;

                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: imageFile.type,
                                data: imageBase64
                            }
                        }
                    ]
                });

                const rawText = response.text;

                // Parse the JSON response
                let parsed = null;
                try {
                    // Try direct parse
                    parsed = JSON.parse(rawText);
                } catch {
                    // Try to extract JSON from markdown code fences
                    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (jsonMatch) {
                        parsed = JSON.parse(jsonMatch[1].trim());
                    } else {
                        // Try to find JSON object in the text
                        const braceMatch = rawText.match(/\{[\s\S]*\}/);
                        if (braceMatch) {
                            parsed = JSON.parse(braceMatch[0]);
                        }
                    }
                }

                if (parsed && parsed.headers && parsed.rows) {
                    return {
                        filename: imageFile.name,
                        text: rawText,
                        headers: parsed.headers,
                        rows: parsed.rows,
                        confidence: 95,
                        modelUsed: modelName
                    };
                } else {
                    // Fallback: could not parse JSON, return raw text
                    return {
                        filename: imageFile.name,
                        text: rawText,
                        headers: [],
                        rows: [],
                        confidence: 60,
                        modelUsed: modelName
                    };
                }
            } catch (error) {
                console.error(`Model ${modelName} failed:`, error.message);
                lastError = error;

                if (error.message.includes('503') || error.message.includes('high demand')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                continue;
            }
        }

        throw lastError || new Error('No working model found');
    };

    // ── Process all images and extract data (with resume support) ──
    const processImages = async (startIndex = 0) => {
        if (images.length === 0) {
            alert('Please select images first');
            return;
        }

        processingRef.current = true;
        setLoading(true);
        setProgress(startIndex > 0 ? (startIndex / images.length) * 100 : 0);
        setError('');

        const imageNames = images.map(img => img.name);

        // Initialize results array (preserve existing if resuming)
        let extractedResults = startIndex > 0
            ? [...extractedData, ...new Array(images.length - startIndex).fill(null)].slice(0, images.length)
            : new Array(images.length).fill(null);

        // If we already have some extracted data from a previous partial run, place them
        if (startIndex > 0 && extractedData.length > 0) {
            extractedData.forEach((item, idx) => {
                if (idx < extractedResults.length) {
                    extractedResults[idx] = item;
                }
            });
        }

        // Save initial session
        saveSession(imageNames, extractedResults, startIndex);

        for (let i = startIndex; i < images.length; i++) {
            if (!processingRef.current) break; // Allow cancellation

            setCurrentImageIndex(i);

            try {
                const result = await extractStructuredDataFromImage(images[i]);
                extractedResults[i] = result;

                // Save progress after each image
                saveSession(imageNames, extractedResults, i + 1);

                setProgress(((i + 1) / images.length) * 100);
                // Update UI with results so far
                setExtractedData(extractedResults.filter(r => r !== null));
            } catch (error) {
                console.error(`Error processing ${images[i].name}:`, error);
                let errorMessage = error.message;
                if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
                    errorMessage = 'The AI service is currently busy. Please wait a moment and try again.';
                } else if (errorMessage.includes('API key')) {
                    errorMessage = 'Invalid API key. Please check your Gemini API key.';
                } else if (errorMessage.includes('quota')) {
                    errorMessage = 'API quota exceeded. Please try again later.';
                } else if (errorMessage.includes('not found')) {
                    errorMessage = 'Model not available. Please check your API key and ensure you have access to Gemini API.';
                } else {
                    errorMessage = 'Failed to extract data. Please try again.';
                }
                setError(errorMessage);

                extractedResults[i] = {
                    filename: images[i].name,
                    text: `Error: ${errorMessage}\n\nPlease try again or check your API key.`,
                    headers: [],
                    rows: [],
                    confidence: 0
                };

                // Save even the error state
                saveSession(imageNames, extractedResults, i + 1);
                setExtractedData(extractedResults.filter(r => r !== null));
            }
        }

        // All done — clear the session
        clearSession();
        setExtractedData(extractedResults.filter(r => r !== null));
        setLoading(false);
        setCurrentImageIndex(-1);
        processingRef.current = false;
    };

    // ── Cancel processing ──
    const cancelProcessing = () => {
        processingRef.current = false;
    };

    // ── Convert extracted data to Excel with DYNAMIC headers ──
    const convertToExcel = () => {
        if (extractedData.length === 0) {
            alert('No extracted data to convert');
            return;
        }

        const wb = XLSX.utils.book_new();

        extractedData.forEach((item, imgIndex) => {
            let sheetName = item.filename.replace(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i, '').substring(0, 28);
            if (extractedData.length > 1) {
                sheetName = `${sheetName}_${imgIndex + 1}`;
            }

            // Metadata rows
            const metadata = [
                ['File Information'],
                ['File Name', item.filename],
                ['Extraction Date', new Date().toLocaleString()],
                ['Confidence Score', `${(item.confidence || 0).toFixed(1)}%`],
                ['Model Used', item.modelUsed || 'N/A'],
                ['']
            ];

            let sheetData;
            let colWidths;

            if (item.headers && item.headers.length > 0 && item.rows && item.rows.length > 0) {
                // Dynamic headers from AI detection
                const excelHeaders = ['S.No', ...item.headers];

                const dataRows = item.rows.map((row, idx) => {
                    const paddedRow = [...row];
                    // Ensure row has same length as headers
                    while (paddedRow.length < item.headers.length) {
                        paddedRow.push('');
                    }
                    return [idx + 1, ...paddedRow];
                });

                // Pad metadata rows to match column count
                const paddedMetadata = metadata.map(row => {
                    const padded = [...row];
                    while (padded.length < excelHeaders.length) {
                        padded.push('');
                    }
                    return padded;
                });

                sheetData = [
                    ...paddedMetadata,
                    excelHeaders,
                    ...dataRows
                ];

                colWidths = excelHeaders.map((header, idx) => {
                    if (idx === 0) return { wch: 8 }; // S.No
                    const maxLen = Math.max(
                        header.length,
                        ...dataRows.map(r => String(r[idx] || '').length)
                    );
                    return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
                });
            } else {
                // Fallback: Show raw text with metadata
                const fallbackRows = (item.text || '').split('\n').map((line, idx) => [
                    idx + 1,
                    line
                ]);

                sheetData = [
                    ...metadata.map(row => row.slice(0, 2)),
                    ['Line', 'Raw Text'],
                    ...fallbackRows
                ];

                colWidths = [
                    { wch: 10 },
                    { wch: 80 }
                ];
            }

            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            ws['!cols'] = colWidths;

            // Style the header row (metadata rows + 1 blank row = index 6)
            const headerRowIndex = metadata.length;
            if (item.headers && item.headers.length > 0) {
                const excelHeaders = ['S.No', ...item.headers];
                for (let c = 0; c < excelHeaders.length; c++) {
                    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: c });
                    if (ws[cellRef]) {
                        ws[cellRef].s = {
                            font: { bold: true },
                            fill: { fgColor: { rgb: "DBEAFE" } }
                        };
                    }
                }
            }

            XLSX.utils.book_append_sheet(wb, ws, `${sheetName}_Summary`);
        });

        const fileName = `Extracted_Data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // ── Export as CSV with DYNAMIC headers ──
    const convertToCSV = () => {
        if (extractedData.length === 0) {
            alert('No extracted data to convert');
            return;
        }

        // Collect all unique headers across all images
        const allHeadersSet = new Set();
        extractedData.forEach(item => {
            if (item.headers) {
                item.headers.forEach(h => allHeadersSet.add(h));
            }
        });
        const allHeaders = Array.from(allHeadersSet);

        if (allHeaders.length === 0) {
            // Fallback if no structured data
            alert('No structured data available for CSV export');
            return;
        }

        const csvHeaders = [...allHeaders, 'Source File'];
        const allRows = [csvHeaders];

        extractedData.forEach((item) => {
            if (item.rows && item.rows.length > 0) {
                item.rows.forEach(row => {
                    const csvRow = allHeaders.map((header, idx) => {
                        // Map by position from this item's headers
                        const headerIdx = item.headers ? item.headers.indexOf(header) : -1;
                        if (headerIdx >= 0 && headerIdx < row.length) {
                            return row[headerIdx];
                        }
                        return '';
                    });
                    csvRow.push(item.filename);
                    allRows.push(csvRow);
                });
            }
        });

        const csvContent = allRows.map(row =>
            row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Extracted_Data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Copy to clipboard
    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Toggle raw text visibility
    const toggleRawText = (index) => {
        setShowRawText(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div style={styles.container}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                
                .btn-hover-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.45) !important;
                    background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%) !important;
                }
                .btn-hover-primary:active:not(:disabled) {
                    transform: translateY(0);
                }
                .btn-hover-success:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.45) !important;
                    background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
                }
                .btn-hover-success:active {
                    transform: translateY(0);
                }
                .btn-hover-warning:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.45) !important;
                    background: linear-gradient(135deg, #D97706 0%, #B45309 100%) !important;
                }
                .btn-hover-warning:active {
                    transform: translateY(0);
                }
                .btn-hover-danger:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.45) !important;
                    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%) !important;
                }
                .preview-card-hover:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15) !important;
                    border-color: #3B82F6 !important;
                }
                .delete-btn-hover:hover {
                    background: #EF4444 !important;
                    transform: scale(1.1);
                }
                .copy-btn-hover:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                }
                .table-row-hover:hover {
                    background: #EFF6FF !important;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .api-key-input-focus:focus {
                    border-color: #3B82F6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
                }
                .btn-hover-reset:hover {
                    background: #E2E8F0 !important;
                    border-color: #CBD5E1 !important;
                    color: #1E293B !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes slideDown {
                    from { max-height: 0; opacity: 0; }
                    to { max-height: 500px; opacity: 1; }
                }
            `}} />

            <div style={styles.headerSection}>
                <h1 style={styles.title}>Image to Excel Converter</h1>
                <p style={styles.subtitle}>Upload images — Gemini AI dynamically detects headings & data → exports to Excel</p>
            </div>

            {/* ── Resume Session Banner ── */}
            {resumeSession && (
                <div style={styles.resumeBanner}>
                    <div style={styles.resumeIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div style={styles.resumeContent}>
                        <h3 style={styles.resumeTitle}>Previous Session Found</h3>
                        <p style={styles.resumeText}>
                            <strong>{resumeSession.results.filter(r => r !== null).length}</strong> of{' '}
                            <strong>{resumeSession.imageNames.length}</strong> images were processed before interruption.
                        </p>
                        <p style={styles.resumeSubtext}>
                            Completed: {resumeSession.imageNames.filter((_, i) => resumeSession.results[i] !== null).join(', ')}
                        </p>
                        <p style={styles.resumeSubtext}>
                            Remaining: {resumeSession.imageNames.filter((_, i) => resumeSession.results[i] === null).join(', ')}
                        </p>
                    </div>
                    <div style={styles.resumeActions}>
                        <button onClick={restoreAndContinue} className="btn-hover-success" style={styles.btn('success')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                            Restore Results
                        </button>
                        <button onClick={dismissResume} className="btn-hover-danger" style={{
                            ...styles.btn('danger'),
                            padding: '8px 16px',
                            fontSize: '0.8rem'
                        }}>
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* API Key settings panel */}
            <div style={styles.settingsCard}>
                <div style={styles.settingsHeader} onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                    <h3 style={styles.settingsTitle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#3B82F6' }}>
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                        Gemini API Key Configuration
                        <span style={apiKey === 'AQ.Ab8RN6KjTOvlFOlZZ1bxynZG5EG2HTm5ghdDeVHFfUFIw8JOrg' ? styles.defaultBadge : styles.customBadge}>
                            {apiKey === 'AQ.Ab8RN6KjTOvlFOlZZ1bxynZG5EG2HTm5ghdDeVHFfUFIw8JOrg' ? 'Default Key' : 'Custom Key'}
                        </span>
                    </h3>
                    <button style={styles.toggleSettingsBtn} type="button">
                        {isSettingsOpen ? 'Hide Settings' : 'Show Settings'}
                    </button>
                </div>

                {isSettingsOpen && (
                    <div style={styles.settingsBody}>
                        <p style={styles.settingsDescription}>
                            Your API key is stored locally in this browser. To clear it or go back, click the "Reset to Default" button.
                        </p>
                        <div style={styles.inputGroup}>
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        localStorage.setItem('gemini_api_key', e.target.value);
                                    }}
                                    placeholder="Enter your Gemini API Key..."
                                    style={styles.apiKeyInput}
                                    className="api-key-input-focus"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    style={styles.eyeBtn}
                                    title={showApiKey ? 'Hide Key' : 'Show Key'}
                                >
                                    {showApiKey ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {apiKey !== 'AQ.Ab8RN6KjTOvlFOlZZ1bxynZG5EG2HTm5ghdDeVHFfUFIw8JOrg' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const defaultKey = 'AQ.Ab8RN6KjTOvlFOlZZ1bxynZG5EG2HTm5ghdDeVHFfUFIw8JOrg';
                                        setApiKey(defaultKey);
                                        localStorage.setItem('gemini_api_key', defaultKey);
                                    }}
                                    style={styles.resetBtn}
                                    className="btn-hover-reset"
                                >
                                    Reset to Default
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div style={styles.card}>
                {error && (
                    <div style={styles.errorBox}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <span style={styles.errorText}>{error}</span>
                        <button style={styles.errorClose} onClick={() => setError('')}>×</button>
                    </div>
                )}

                <div
                    style={styles.dropzone(isDragging)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                >
                    <svg style={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <h3 style={styles.uploadText}>Drag and drop images here</h3>
                    <p style={styles.uploadSubtext}>Or click to browse (Max 20 images. JPG, PNG, GIF, BMP, TIFF, WebP)</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                {images.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '16px' }}>
                            Selected Files ({images.length})
                        </h3>
                        <div style={styles.previewGrid}>
                            {images.map((image, index) => (
                                <div key={index} className="preview-card-hover" style={{
                                    ...styles.previewCard,
                                    ...(loading && currentImageIndex === index ? {
                                        borderColor: '#3B82F6',
                                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                                    } : {}),
                                    ...(loading && currentImageIndex > index ? {
                                        opacity: 0.6
                                    } : {})
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="delete-btn-hover"
                                        style={styles.deleteBtn}
                                        title="Remove image"
                                        disabled={loading}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>

                                    {/* Processing indicator on card */}
                                    {loading && currentImageIndex === index && (
                                        <div style={styles.processingOverlay}>
                                            <div style={styles.processingSpinner}></div>
                                        </div>
                                    )}
                                    {loading && currentImageIndex > index && (
                                        <div style={styles.completedOverlay}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    )}

                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        style={styles.previewImage}
                                    />
                                    <div style={styles.previewInfo} title={image.name}>
                                        {image.name.length > 25 ? image.name.substring(0, 22) + '...' : image.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563EB' }}>
                                Processing image {currentImageIndex + 1} of {images.length}...
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB' }}>{Math.round(progress)}%</span>
                        </div>
                        <div style={styles.progressContainer}>
                            <div style={styles.progressBar(progress)}></div>
                        </div>
                        <div style={{ marginTop: '8px', textAlign: 'right' }}>
                            <button
                                onClick={cancelProcessing}
                                style={{
                                    background: 'none',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    padding: '4px 12px',
                                    fontSize: '0.75rem',
                                    color: '#64748B',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {images.length > 0 && !loading && (
                    <div style={styles.actionSection}>
                        <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
                            Ready to process <strong>{images.length}</strong> image{images.length > 1 ? 's' : ''} with Gemini AI
                        </div>
                        <button
                            onClick={() => processImages(0)}
                            disabled={loading}
                            className="btn-hover-primary"
                            style={{
                                ...styles.btn('primary'),
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-4.5-6z" />
                                <path d="M9.5 2v6h6" />
                                <circle cx="12" cy="15" r="3" />
                                <line x1="12" y1="12" x2="12" y2="10" />
                            </svg>
                            Extract Data
                        </button>
                    </div>
                )}
            </div>

            {/* ── Extracted Data Results with DYNAMIC TABLE ── */}
            {extractedData.length > 0 && (
                <div style={styles.card}>
                    <div style={styles.extractedTitleSection}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Extracted Data</h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '4px 0 0 0' }}>
                                AI-detected headings & data — Ready for Excel export
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={convertToCSV}
                                className="btn-hover-warning"
                                style={styles.btn('warning')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                Export CSV
                            </button>
                            <button
                                onClick={convertToExcel}
                                className="btn-hover-success"
                                style={styles.btn('success')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                Export to Excel
                            </button>
                        </div>
                    </div>

                    <div style={styles.extractedGrid}>
                        {extractedData.map((item, idx) => (
                            <div key={idx} style={styles.extractedCard}>
                                <div style={styles.extractedCardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: '#EFF6FF',
                                            color: '#2563EB',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.9rem'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
                                                {item.filename}
                                            </h4>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                                                {item.modelUsed && (
                                                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                                        Model: {item.modelUsed}
                                                    </span>
                                                )}
                                                {item.headers && item.headers.length > 0 && (
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '999px',
                                                        background: '#ECFDF5',
                                                        color: '#065F46',
                                                        fontWeight: 600
                                                    }}>
                                                        {item.headers.length} columns · {item.rows ? item.rows.length : 0} rows
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={styles.badge(item.confidence)}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        Confidence: {(item.confidence || 0).toFixed(1)}%
                                    </span>
                                </div>

                                {/* ── DYNAMIC TABLE PREVIEW ── */}
                                {item.headers && item.headers.length > 0 && item.rows && item.rows.length > 0 ? (
                                    <div style={styles.tableContainer}>
                                        <div style={styles.tableWrapper}>
                                            <table style={styles.dataTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.tableHeaderCell}>S.No</th>
                                                        {item.headers.map((header, hIdx) => (
                                                            <th key={hIdx} style={styles.tableHeaderCell}>
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.rows.map((row, rIdx) => (
                                                        <tr key={rIdx} className="table-row-hover" style={styles.tableRow(rIdx)}>
                                                            <td style={styles.tableCellSno}>{rIdx + 1}</td>
                                                            {item.headers.map((_, cIdx) => (
                                                                <td key={cIdx} style={styles.tableCell}>
                                                                    {row[cIdx] !== undefined ? row[cIdx] : ''}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={styles.tableFooter}>
                                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                                Total: {item.rows.length} row{item.rows.length > 1 ? 's' : ''} × {item.headers.length} column{item.headers.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '16px',
                                        background: '#FEF3C7',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        color: '#92400E',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span>⚠️</span>
                                        <span>Could not detect structured table data. See raw text below.</span>
                                    </div>
                                )}

                                {/* ── Raw Text Toggle ── */}
                                <div style={{ marginTop: '12px' }}>
                                    <button
                                        onClick={() => toggleRawText(idx)}
                                        style={styles.rawTextToggle}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            style={{ transform: showRawText[idx] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                        {showRawText[idx] ? 'Hide' : 'Show'} Raw AI Response
                                    </button>

                                    {showRawText[idx] && (
                                        <div style={styles.codeBlockContainer}>
                                            <button
                                                onClick={() => copyToClipboard(item.text, idx)}
                                                className="copy-btn-hover"
                                                style={styles.copyBtn}
                                            >
                                                {copiedIndex === idx ? '✓ Copied!' : 'Copy'}
                                            </button>
                                            <pre style={styles.codeBlock}>
                                                {item.text || 'No text extracted'}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        color: '#1E293B',
        background: '#F8FAFC',
        minHeight: '100vh'
    },
    // ── Resume banner ──
    resumeBanner: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1px solid #FDBA74',
        boxShadow: '0 4px 20px -5px rgba(251, 146, 60, 0.15)',
        animation: 'fadeIn 0.3s ease',
    },
    resumeIcon: {
        color: '#EA580C',
        marginTop: '2px',
        flexShrink: 0,
    },
    resumeContent: {
        flex: 1,
    },
    resumeTitle: {
        margin: '0 0 4px 0',
        fontSize: '1.05rem',
        fontWeight: 700,
        color: '#9A3412',
    },
    resumeText: {
        margin: '0 0 6px 0',
        fontSize: '0.875rem',
        color: '#C2410C',
    },
    resumeSubtext: {
        margin: '0 0 2px 0',
        fontSize: '0.75rem',
        color: '#EA580C',
        opacity: 0.8,
    },
    resumeActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0,
    },
    // ── Settings ──
    settingsCard: {
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.02)',
        padding: '20px',
        marginBottom: '24px',
        transition: 'all 0.3s ease',
    },
    settingsHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        userSelect: 'none',
    },
    settingsTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: 0,
    },
    defaultBadge: {
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: '#F1F5F9',
        color: '#475569',
        border: '1px solid #E2E8F0',
        marginLeft: '10px',
    },
    customBadge: {
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: '#E0F2FE',
        color: '#0369A1',
        border: '1px solid #BAE6FD',
        marginLeft: '10px',
    },
    toggleSettingsBtn: {
        background: 'none',
        border: 'none',
        color: '#3B82F6',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'background 0.2s',
    },
    settingsBody: {
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #F1F5F9',
        animation: 'fadeIn 0.2s ease-in-out',
    },
    settingsDescription: {
        fontSize: '0.825rem',
        color: '#64748B',
        margin: '0 0 12px 0',
        lineHeight: '1.4',
    },
    inputGroup: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    inputWrapper: {
        position: 'relative',
        flex: 1,
        minWidth: '280px',
    },
    apiKeyInput: {
        width: '100%',
        padding: '10px 40px 10px 14px',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
        fontSize: '0.85rem',
        fontFamily: "'Fira Code', monospace",
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        background: '#F8FAFC',
        color: '#334155',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#94A3B8',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s',
    },
    resetBtn: {
        padding: '10px 16px',
        borderRadius: '10px',
        background: '#F1F5F9',
        color: '#475569',
        fontWeight: 600,
        fontSize: '0.85rem',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    // ── Main layout ──
    headerSection: {
        textAlign: 'left',
        marginBottom: '32px',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 800,
        margin: '0 0 8px 0',
        background: 'linear-gradient(135deg, #1E293B 0%, #3B82F6 50%, #10B981 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#64748B',
        margin: 0,
        fontWeight: 400,
        lineHeight: '1.5',
    },
    card: {
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04)',
        padding: '32px',
        marginBottom: '32px',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: '#FEF2F2',
        border: '1px solid #FEE2E2',
        marginBottom: '20px',
    },
    errorIcon: {
        fontSize: '1.1rem',
    },
    errorText: {
        flex: 1,
        fontSize: '0.85rem',
        color: '#DC2626',
    },
    errorClose: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#DC2626',
    },
    dropzone: (isDragging) => ({
        border: `2px dashed ${isDragging ? '#3B82F6' : '#CBD5E1'}`,
        borderRadius: '20px',
        padding: '50px 20px',
        textAlign: 'center',
        background: isDragging ? 'rgba(59, 130, 246, 0.03)' : '#F8FAFC',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: isDragging ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
        transform: isDragging ? 'scale(1.005)' : 'scale(1)',
    }),
    uploadIcon: {
        width: '56px',
        height: '56px',
        color: '#3B82F6',
        marginBottom: '6px',
    },
    uploadText: {
        fontSize: '1.15rem',
        fontWeight: 700,
        color: '#334155',
        margin: 0,
    },
    uploadSubtext: {
        fontSize: '0.875rem',
        color: '#64748B',
        margin: 0,
    },
    previewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
    },
    previewCard: {
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        background: '#FFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
    },
    previewImage: {
        width: '100%',
        height: '110px',
        objectFit: 'cover',
        display: 'block',
    },
    previewInfo: {
        padding: '8px',
        fontSize: '0.7rem',
        color: '#475569',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        borderTop: '1px solid #F1F5F9',
        textAlign: 'center',
    },
    deleteBtn: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFF',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        zIndex: 10,
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    processingSpinner: {
        width: '28px',
        height: '28px',
        border: '3px solid rgba(59, 130, 246, 0.2)',
        borderTopColor: '#3B82F6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    completedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(16, 185, 129, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    actionSection: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid #F1F5F9',
    },
    btn: (variant) => {
        let base = {
            padding: '12px 28px',
            borderRadius: '14px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            outline: 'none',
        };
        if (variant === 'primary') {
            return {
                ...base,
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            };
        }
        if (variant === 'success') {
            return {
                ...base,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            };
        }
        if (variant === 'warning') {
            return {
                ...base,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            };
        }
        if (variant === 'danger') {
            return {
                ...base,
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            };
        }
        return base;
    },
    progressContainer: {
        width: '100%',
        background: '#F1F5F9',
        borderRadius: '999px',
        height: '8px',
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: (progress) => ({
        width: `${progress}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
        borderRadius: '999px',
        transition: 'width 0.3s ease',
    }),
    extractedTitleSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid #F1F5F9',
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    extractedGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    extractedCard: {
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
    },
    extractedCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    badge: (confidence) => {
        const isHigh = confidence >= 80;
        return {
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            background: isHigh ? '#DEF7EC' : '#FEF08A',
            color: isHigh ? '#03543F' : '#713F12',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
        };
    },
    // ── Dynamic Table ──
    tableContainer: {
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
    },
    tableWrapper: {
        overflowX: 'auto',
        maxHeight: '450px',
        overflowY: 'auto',
    },
    dataTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.825rem',
    },
    tableHeaderCell: {
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: '0.75rem',
        color: '#475569',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        borderBottom: '2px solid #E2E8F0',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },
    tableRow: (index) => ({
        background: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
        transition: 'background 0.15s ease',
    }),
    tableCell: {
        padding: '10px 16px',
        borderBottom: '1px solid #F1F5F9',
        color: '#334155',
        fontSize: '0.825rem',
        whiteSpace: 'nowrap',
    },
    tableCellSno: {
        padding: '10px 16px',
        borderBottom: '1px solid #F1F5F9',
        color: '#94A3B8',
        fontSize: '0.75rem',
        fontWeight: 600,
        textAlign: 'center',
        width: '50px',
    },
    tableFooter: {
        padding: '8px 16px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    // ── Raw text toggle ──
    rawTextToggle: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        color: '#64748B',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'all 0.2s',
    },
    codeBlockContainer: {
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        marginTop: '8px',
    },
    codeBlock: {
        background: '#0F172A',
        color: '#E2E8F0',
        padding: '16px',
        margin: 0,
        fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
        fontSize: '0.8rem',
        lineHeight: '1.6',
        maxHeight: '200px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
    copyBtn: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '6px',
        padding: '5px 12px',
        color: '#FFF',
        fontSize: '0.7rem',
        fontWeight: 600,
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease',
        zIndex: 5,
    },
};

export default Convert_Img_to_Excel;