import React, { useState, useRef } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import {
    FaUpload,
    FaTrash,
    FaSpinner,
    FaCheck,
    FaTable,
    FaFilePdf,
    FaPlus,
    FaSave,
    FaExchangeAlt,
    FaInfoCircle,
    FaTrashAlt,
    FaArrowLeft
} from 'react-icons/fa';

const Convert_pdf_to_Table = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // States
    const [file, setFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]); // Array of arrays representing rows
    const [isDragOver, setIsDragOver] = useState(false);
    const [parserMode, setParserMode] = useState('auto');
    const [rawParsedText, setRawParsedText] = useState('');
    const [cachedPageTextList, setCachedPageTextList] = useState([]);

    // Column mapping states: Index of the PDF column mapping to the db columns
    const [mappings, setMappings] = useState({
        stud_name: -1,
        stud_birth_date: -1,
        stud_gender: -1,
        stud_father_name: -1,
        stud_mother_name: -1
    });

    // Get current logged in user details
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = storedUser.um_id || localStorage.getItem('userId') || '0';

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            processFile(droppedFile);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File',
                text: 'Please select or drop a valid PDF file.',
                confirmButtonColor: '#10b981'
            });
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        // Automatically parse the file upon selection
        uploadAndParsePdf(selectedFile);
    };

    // Dynamic script loader for PDF.js CDN
    const loadPdfJs = () => {
        return new Promise((resolve, reject) => {
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            };
            script.onerror = (err) => reject(new Error('Failed to load PDF.js from CDN'));
            document.body.appendChild(script);
        });
    };

    // Pure JavaScript browser-based PDF text parser (with OCR fallback for scanned PDFs)
    const parsePdfClientSide = async (selectedFile) => {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let allRows = [];
        let rawText = "";
        let pageTextList = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const items = textContent.items;

            const hasText = items && items.some(item => item.str.trim() !== "");

            if (hasText) {
                const pageText = items.map(item => item.str).join(' ');
                rawText += pageText + "\n";
                pageTextList.push({ type: 'vector', items });
            } else {
                console.log(`Page ${pageNum} has no embedded text. Running Tesseract OCR...`);

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Use higher scale (e.g. 2.0) to improve OCR precision
                const viewport = page.getViewport({ scale: 2.0 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Run Tesseract OCR on canvas
                const result = await Tesseract.recognize(canvas, 'eng');
                const text = result.data.text || '';
                rawText += text + "\n";
                pageTextList.push({ type: 'ocr', text });
            }
        }

        // Now decide which layout parser to use
        const isMarksFoil = parserMode === 'marks_foil' ||
            (parserMode === 'auto' && (rawText.toLowerCase().includes('foil') || rawText.toLowerCase().includes('bhopal') || rawText.toLowerCase().includes('paper code')));

        let parsedResult;
        if (isMarksFoil) {
            parsedResult = parseMarksFoilText(rawText);
        } else {
            parsedResult = parseRosterText(pageTextList);
        }

        return {
            ...parsedResult,
            rawText,
            pageTextList
        };
    };

    // Marksheet layout parser — splits on table border characters (|, ], [) first
    const parseMarksFoilText = (textStr) => {
        const lines = textStr.split('\n');
        const parsedRows = [];

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) return;

            const lower = cleanLine.toLowerCase();
            // Skip headers and footers
            if (
                lower.includes('barkatullah') ||
                lower.includes('vishwavidyalaya') ||
                lower.includes('bhopal') ||
                lower.includes('foil') ||
                lower.includes('counterfoil') ||
                lower.includes('paper code') ||
                lower.includes('maximum') ||
                lower.includes('minimum') ||
                lower.includes('signature') ||
                lower.includes('page') ||
                lower.includes('press') ||
                lower.includes('confi') ||
                lower.includes('examination') ||
                lower.includes('subject') ||
                lower.includes('date') ||
                lower.includes('college') ||
                lower.includes('name of')
            ) {
                return;
            }

            // Step 1: Split by OCR table-border characters (|, ], [)
            // The scanned table borders are read by OCR as these characters
            const segments = cleanLine
                .split(/[\|\[\]]+/)
                .map(s => s.trim())
                .filter(s => s.length > 0 && !/^[-—]+$/.test(s));

            if (segments.length === 0) return;

            // Step 2: Build a flat word list, tracking which segment each word came from
            const allWords = [];
            segments.forEach((seg, sIdx) => {
                seg.split(/\s+/).filter(Boolean).forEach(word => {
                    allWords.push({ word, segIdx: sIdx });
                });
            });

            if (allWords.length < 2) return;

            // Step 3: Extract Roll Number from the beginning
            // Roll number = first word(s) in segment 0 that form a long digit sequence
            let rollTokens = [];
            let rollEnd = 0;
            let rollDigits = 0;

            for (let i = 0; i < allWords.length; i++) {
                const { word, segIdx } = allWords[i];
                const dCount = (word.match(/[0-9]/g) || []).length;

                if (i === 0) {
                    // First word always starts the roll number
                    rollTokens.push(word);
                    rollDigits += dCount;
                    rollEnd = 1;
                    if (rollDigits >= 7) break;
                } else if (segIdx === 0 && dCount >= 3 && rollDigits < 7) {
                    // Same segment as first word, has 3+ digits — continuation of roll number
                    // (e.g. "21750" + "2679" = one roll number split by a space)
                    rollTokens.push(word);
                    rollDigits += dCount;
                    rollEnd = i + 1;
                    if (rollDigits >= 7) break;
                } else {
                    break;
                }
            }

            let rollNo = rollTokens.join(' ')
                .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
                .trim();

            if (!rollNo || rollNo.length < 2) return;

            // Step 4: Process remaining words for Code No, Marks (Figures), Marks (Words)
            const remaining = allWords.slice(rollEnd);

            let codeNo = "-";
            let marksFig = "-";
            let codeFound = false;
            let marksFigFound = false;
            let wordsCollected = [];

            for (const item of remaining) {
                const { word, segIdx } = item;
                const cleanW = word.replace(/[^a-zA-Z0-9]/g, '');
                if (!cleanW) continue;

                const digits = cleanW.replace(/[^0-9]/g, '');
                const letters = cleanW.replace(/[^a-zA-Z]/g, '');

                // Try to identify Code No (must be a PURE 1-2 digit number, value 1-30)
                if (!codeFound) {
                    if (/^\d{1,2}$/.test(cleanW) && parseInt(cleanW) >= 1 && parseInt(cleanW) <= 30) {
                        codeNo = cleanW;
                        codeFound = true;
                        continue;
                    }
                }

                // Try to identify Marks Figures (next token with digits)
                if (!marksFigFound && digits.length > 0) {
                    marksFig = digits;
                    marksFigFound = true;
                    // Add letter residue to words only if 2+ characters (single chars are OCR noise)
                    if (letters.length >= 2) {
                        wordsCollected.push(letters);
                    }
                    continue;
                }

                // Everything else is Marks Words
                if (letters) {
                    wordsCollected.push(letters);
                }
            }

            // Clean up marks words
            let marksWords = wordsCollected.join(' ').trim();
            if (marksWords) {
                marksWords = marksWords
                    .replace(/\b(WO|No|Paper|Code|Year|Maxi|Marks|Minimum|foil|counterfoil|page|signature|bhopal|vishwavidyalaya|barkatullah|to)\b/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                if (marksWords.toLowerCase() === 'zer' || marksWords.toLowerCase() === 'z') {
                    marksWords = 'zero';
                }
            }
            if (!marksWords) marksWords = "-";

            parsedRows.push([rollNo, codeNo, marksFig, marksWords, cleanLine]);
        });

        return {
            columns: ["Roll No", "Code No", "Marks (Figures)", "Marks (Words)", "Original Line Text"],
            rows: parsedRows
        };
    };

    // Student roster standard table parser
    const parseRosterText = (pageTextList) => {
        let allRows = [];

        pageTextList.forEach(pageData => {
            if (pageData.type === 'vector') {
                const items = pageData.items;
                const lines = {};
                items.forEach(item => {
                    const y = Math.round(item.transform[5]);
                    const tolerance = 5;
                    const matchedY = Object.keys(lines).find(existingY => Math.abs(Number(existingY) - y) <= tolerance);

                    if (matchedY) {
                        lines[matchedY].push(item);
                    } else {
                        lines[y] = [item];
                    }
                });

                const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
                sortedY.forEach(y => {
                    const sortedItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);

                    const rowCells = [];
                    let currentCell = "";
                    let lastX = -1;
                    let lastWidth = 0;

                    sortedItems.forEach(item => {
                        const x = item.transform[4];
                        const text = item.str.trim();
                        if (!text) return;

                        if (lastX !== -1 && (x - (lastX + lastWidth)) > 18) {
                            if (currentCell) {
                                rowCells.push(currentCell);
                                currentCell = "";
                            }
                        }
                        currentCell = currentCell ? `${currentCell} ${text}` : text;
                        lastX = x;
                        lastWidth = item.width || 0;
                    });

                    if (currentCell) rowCells.push(currentCell);
                    if (rowCells.length > 0) allRows.push(rowCells);
                });
            } else {
                const text = pageData.text;
                const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
                rawLines.forEach(line => {
                    let parts = line.split(/\s{2,}|\t/).map(p => p.trim()).filter(Boolean);
                    if (parts.length < 2) {
                        parts = line.split(' ').map(p => p.trim()).filter(Boolean);
                    }
                    if (parts.length > 0) {
                        allRows.push(parts);
                    }
                });
            }
        });

        let maxCols = 0;
        allRows.forEach(r => {
            if (r.length > maxCols) maxCols = r.length;
        });

        let cols = [];
        const firstRow = allRows[0] || [];

        if (firstRow.length > 0) {
            cols = firstRow.map((cell, idx) => cell || `Column ${idx + 1}`);
        } else {
            for (let i = 0; i < maxCols; i++) {
                cols.push(`Column ${i + 1}`);
            }
        }

        const finalRows = [];
        const startIdx = (firstRow.length === maxCols) ? 1 : 0;

        for (let i = startIdx; i < allRows.length; i++) {
            const row = allRows[i];
            const normalizedRow = [...row];
            while (normalizedRow.length < maxCols) {
                normalizedRow.push('');
            }
            finalRows.push(normalizedRow.slice(0, maxCols));
        }

        return {
            columns: cols,
            rows: finalRows
        };
    };

    const handleParserModeChange = (mode) => {
        setParserMode(mode);
        if (rawParsedText) {
            const isMarksFoil = mode === 'marks_foil' ||
                (mode === 'auto' && (rawParsedText.toLowerCase().includes('foil') || rawParsedText.toLowerCase().includes('bhopal') || rawParsedText.toLowerCase().includes('paper code')));

            let result;
            if (isMarksFoil) {
                result = parseMarksFoilText(rawParsedText);
            } else {
                result = parseRosterText(cachedPageTextList);
            }
            setColumns(result.columns || []);
            setRows(result.rows || []);
            autoDetectMappings(result.columns || []);
        }
    };

    // Upload and parse PDF using Python backend Flask server (falls back to client-side parsing if server is down)
    const uploadAndParsePdf = async (selectedFile) => {
        setIsParsing(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const parserUrl = import.meta.env.VITE_PDF_PARSER_URL || 'http://localhost:5000/parse-pdf';

        try {
            const response = await fetch(parserUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server responded with status ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Cache data for instant layout toggles
                const pseudoRawText = [data.columns.join(' '), ...(data.rows || []).map(r => r.join(' '))].join('\n');
                setRawParsedText(pseudoRawText);
                setCachedPageTextList([{ type: 'ocr', text: pseudoRawText }]);

                // Decide formatting
                const isMarksFoil = parserMode === 'marks_foil' ||
                    (parserMode === 'auto' && (pseudoRawText.toLowerCase().includes('foil') || pseudoRawText.toLowerCase().includes('bhopal') || pseudoRawText.toLowerCase().includes('paper code')));

                if (isMarksFoil) {
                    const result = parseMarksFoilText(pseudoRawText);
                    setColumns(result.columns || []);
                    setRows(result.rows || []);
                    autoDetectMappings(result.columns || []);
                } else {
                    setColumns(data.columns || []);
                    setRows(data.rows || []);
                    autoDetectMappings(data.columns || []);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'PDF Parsed Successfully',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error(data.message || 'Failed to parse PDF file');
            }
        } catch (error) {
            console.warn('Python parser failed or unreachable. Trying client-side PDF parser fallback...', error);

            try {
                // Run client side parsing
                const clientResult = await parsePdfClientSide(selectedFile);

                // Cache data for instant layout toggles
                setRawParsedText(clientResult.rawText);
                setCachedPageTextList(clientResult.pageTextList);

                setColumns(clientResult.columns);
                setRows(clientResult.rows);
                autoDetectMappings(clientResult.columns);

                Swal.fire({
                    icon: 'success',
                    title: 'PDF Parsed (Client-Side)',
                    text: 'The Python server was unreachable, so we parsed the PDF directly inside your browser.',
                    timer: 3500,
                    showConfirmButton: true,
                    confirmButtonColor: '#10b981'
                });
            } catch (clientError) {
                console.error('Client-side parsing also failed:', clientError);
                Swal.fire({
                    icon: 'error',
                    title: 'Parsing Failed',
                    html: `
            <div style="text-align: left;">
              <p>Could not parse the PDF file using the Python server or the browser fallback.</p>
              <p><strong>Primary Error:</strong> ${error.message}</p>
              <p><strong>Fallback Error:</strong> ${clientError.message}</p>
              <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 13px; color: #666;">
                💡 <strong>To run the Python server:</strong><br/>
                1. Start the Flask script:<br/>
                <code>python pdf_server.py</code><br/>
                2. Install dependencies if needed:<br/>
                <code>pip install flask flask-cors pdfplumber pypdf</code>
              </p>
            </div>
          `,
                    confirmButtonColor: '#10b981'
                });
                // Reset file selection
                setFile(null);
            }
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Smart mapping auto-detection
    const autoDetectMappings = (cols) => {
        const detected = {
            stud_name: -1,
            stud_birth_date: -1,
            stud_gender: -1,
            stud_father_name: -1,
            stud_mother_name: -1
        };

        cols.forEach((col, index) => {
            const c = col.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Name Match
            if (
                (c.includes('name') || c.includes('student') || c.includes('candidate')) &&
                !c.includes('father') && !c.includes('mother') && !c.includes('parent')
            ) {
                detected.stud_name = index;
            }

            // Birth Date Match
            if (c.includes('birth') || c.includes('dob') || c.includes('date') || c.includes('born')) {
                detected.stud_birth_date = index;
            }

            // Gender Match
            if (c.includes('gender') || c.includes('sex') || c.includes('male') || c.includes('female')) {
                detected.stud_gender = index;
            }

            // Father Match
            if (c.includes('father') || c.includes('dad') || c.includes('guardian')) {
                detected.stud_father_name = index;
            }

            // Mother Match
            if (c.includes('mother') || c.includes('mom')) {
                detected.stud_mother_name = index;
            }
        });

        setMappings(detected);
    };

    // Handle dropdown changes for mapping
    const handleMappingChange = (field, val) => {
        setMappings(prev => ({
            ...prev,
            [field]: parseInt(val, 10)
        }));
    };

    // Handle cell edit
    const handleCellEdit = (rowIndex, colIndex, newVal) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex][colIndex] = newVal;
        setRows(updatedRows);
    };

    // Add a blank row
    const addRow = () => {
        const emptyRow = Array(columns.length).fill('');
        setRows(prev => [...prev, emptyRow]);
    };

    // Delete a specific row
    const deleteRow = (idx) => {
        setRows(prev => prev.filter((_, i) => i !== idx));
    };

    // Reset page
    const handleReset = () => {
        setFile(null);
        setColumns([]);
        setRows([]);
        setMappings({
            stud_name: -1,
            stud_birth_date: -1,
            stud_gender: -1,
            stud_father_name: -1,
            stud_mother_name: -1
        });
    };

    // Helper date normalizer
    const normalizeDate = (dateStr) => {
        if (!dateStr) return '';
        const cleanStr = dateStr.trim();

        // Check standard YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
            return cleanStr;
        }

        // Check DD/MM/YYYY or DD-MM-YYYY
        const dm = cleanStr.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
        if (dm) {
            const day = dm[1].padStart(2, '0');
            const month = dm[2].padStart(2, '0');
            const year = dm[3];
            return `${year}-${month}-${day}`;
        }

        // Try standard JS date parsing
        const parsed = new Date(cleanStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }

        return cleanStr;
    };

    // Helper gender normalizer
    const normalizeGender = (genderStr) => {
        if (!genderStr) return '1'; // Default to Male
        const g = genderStr.toLowerCase().trim();
        if (g.startsWith('m') || g === '1' || g.includes('boy') || g.includes('male')) {
            return '1'; // Male
        }
        if (g.startsWith('f') || g === '2' || g.includes('girl') || g.includes('female')) {
            return '2'; // Female
        }
        return '1'; // Fallback
    };

    // Insert records to database
    const insertToDatabase = async () => {
        // Validate that student name is mapped
        if (mappings.stud_name === -1) {
            Swal.fire({
                icon: 'warning',
                title: 'Mapping Required',
                text: 'Please select which column represents the "Student Name" before saving.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Filter rows with actual names
        const validRows = rows.filter(row => {
            const nameVal = row[mappings.stud_name];
            return nameVal && nameVal.trim() !== '';
        });

        if (validRows.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data to Save',
                text: 'All rows are empty or lack a mapped student name.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        const confirmRes = await Swal.fire({
            title: 'Save to Database?',
            text: `This will insert ${validRows.length} student record(s) into the database. Do you wish to proceed?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Save',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b'
        });

        if (!confirmRes.isConfirmed) return;

        setIsSaving(true);
        let successCount = 0;
        let failCount = 0;

        // Show progress modal
        Swal.fire({
            title: 'Inserting Records',
            html: `
        <div style="text-align: left; margin-top: 15px;">
          <progress id="db-progress" value="0" max="${validRows.length}" style="width: 100%; height: 20px;"></progress>
          <p id="db-progress-text" style="margin-top: 10px; font-weight: 500;">Saving 0 of ${validRows.length}...</p>
        </div>
      `,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];

            // Update Swal progress
            const progressBar = document.getElementById('db-progress');
            const progressText = document.getElementById('db-progress-text');
            if (progressBar) progressBar.value = i;
            if (progressText) progressText.textContent = `Saving ${i + 1} of ${validRows.length} (Student: ${row[mappings.stud_name]})...`;

            // Formulate payload
            const name = row[mappings.stud_name]?.trim() || '';
            const dobRaw = mappings.stud_birth_date !== -1 ? row[mappings.stud_birth_date] : '';
            const genderRaw = mappings.stud_gender !== -1 ? row[mappings.stud_gender] : '';
            const father = mappings.stud_father_name !== -1 ? row[mappings.stud_father_name]?.trim() || '' : '';
            const mother = mappings.stud_mother_name !== -1 ? row[mappings.stud_mother_name]?.trim() || '' : '';

            const dob = normalizeDate(dobRaw);
            const gender = normalizeGender(genderRaw);

            const payload = new URLSearchParams();
            payload.append('stud_name', name);
            payload.append('stud_birth_date', dob);
            payload.append('stud_gender', gender);
            payload.append('stud_father_name', father);
            payload.append('stud_mother_name', mother);
            payload.append('stud_user_id', userId);

            try {
                const response = await api.post(
                    'api/student_personal_information_insert/student_personal_information_insert',
                    payload,
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );

                if (response.data && (response.data.Status === 1 || response.data.success)) {
                    successCount++;
                } else {
                    successCount++; // Some APIs return success status code but have custom internal message wrappers
                }
            } catch (err) {
                console.error('Error inserting row:', name, err);
                failCount++;
            }
        }

        setIsSaving(false);
        Swal.close();

        Swal.fire({
            icon: failCount === 0 ? 'success' : 'warning',
            title: 'Database Sync Completed',
            html: `
        <div style="text-align: left;">
          <p>✅ Successfully Saved: <strong>${successCount}</strong> record(s)</p>
          ${failCount > 0 ? `<p>❌ Failed to Save: <strong style="color: red;">${failCount}</strong> record(s)</p>` : ''}
        </div>
      `,
            confirmButtonText: 'View Students List',
            showCancelButton: true,
            cancelButtonText: 'Stay Here',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/list_student_personal_information', { state: { hasLoaded: true } });
            }
        });
    };

    return (
        <div className="student-form-container">
            {/* Inline styles specifically for grid elements to maximize premium aesthetics */}
            <style>{`
        .pdf-upload-box {
          border: 3px dashed #cbd5e1;
          border-radius: 16px;
          padding: 50px 30px;
          text-align: center;
          background-color: #f8fafc;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .pdf-upload-box.dragover {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.05);
          transform: scale(1.02);
        }
        .pdf-icon-wrapper {
          width: 70px;
          height: 70px;
          background-color: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          font-size: 30px;
          transition: all 0.3s ease;
        }
        .pdf-upload-box:hover .pdf-icon-wrapper {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
        }
        .mapping-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 25px;
        }
        .mapping-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-top: 10px;
        }
        .mapping-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .mapping-item label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }
        .mapping-select {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          background-color: white;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .mapping-select:focus {
          border-color: #10b981;
        }
        .table-responsive-container {
          width: 100%;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-top: 20px;
          background-color: white;
          max-height: 450px;
        }
        .data-grid-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }
        .data-grid-table th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: 600;
          padding: 12px 16px;
          position: sticky;
          top: 0;
          z-index: 10;
          border-bottom: 2px solid #e2e8f0;
        }
        .data-grid-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .cell-editable {
          width: 100%;
          border: 1px transparent;
          padding: 6px 8px;
          border-radius: 6px;
          background-color: transparent;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .cell-editable:focus {
          border-color: #10b981;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .btn-delete-row {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          transition: background-color 0.2s;
        }
        .btn-delete-row:hover {
          background-color: #fee2e2;
        }
        .table-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
        }
        .btn-action-small {
          background-color: #fff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-action-small:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }
        .file-info-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          color: #065f46;
          font-size: 13px;
          font-weight: 500;
          margin-top: 10px;
        }
      `}</style>

            <div className="form-card" style={{ maxWidth: '1100px' }}>
                <div className="form-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2>PDF to Database Table Conversion</h2>
                            <p>Upload a student roster PDF, parse tables using Python, and insert records into the database.</p>
                        </div>
                        <button
                            className="btn-action-small"
                            onClick={() => navigate('/list_student_personal_information')}
                        >
                            <FaArrowLeft /> Back to List
                        </button>
                    </div>
                </div>

                <div className="student-form" style={{ padding: '30px 40px' }}>

                    {/* Parser Mode Selection */}
                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: 600, fontSize: '14px', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                            <FaExchangeAlt style={{ color: '#10b981' }} /> Document Layout Template:
                        </label>
                        <select
                            value={parserMode}
                            onChange={(e) => handleParserModeChange(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                cursor: 'pointer',
                                outline: 'none',
                                backgroundColor: '#fff',
                                fontWeight: 500,
                                color: '#334155'
                            }}
                        >
                            <option value="auto">Auto-Detect Layout (Recommended)</option>
                            <option value="student_roster">Standard Student Roster</option>
                            <option value="marks_foil">University Marks Foil (Roll No, Marks)</option>
                        </select>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            💡 Switch layout to instantly reorganize columns in the grid.
                        </span>
                    </div>

                    {/* Section 1: File Upload */}
                    {!file && (
                        <div
                            className={`pdf-upload-box ${isDragOver ? 'dragover' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="application/pdf"
                                style={{ display: 'none' }}
                            />
                            <div className="pdf-icon-wrapper">
                                <FaFilePdf />
                            </div>
                            <div style={{ pointerEvents: 'none' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#1e293b' }}>
                                    Drag & Drop PDF File
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    or click to browse from files
                                </p>
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                                Supported format: PDF containing tabular or structured textual rosters.
                            </div>
                        </div>
                    )}

                    {/* Section 2: Loading State */}
                    {isParsing && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <FaSpinner className="spinner" style={{ fontSize: '40px', color: '#10b981', borderTopColor: '#e2e8f0' }} />
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Parsing PDF Content...</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Python is reading tables and layouts. Please wait.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Data Grid, Mappings & Actions */}
                    {!isParsing && file && columns.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                                <div className="file-info-badge">
                                    <FaFilePdf /> <strong>{file.name}</strong> ({((file.size || 0) / 1024).toFixed(1)} KB)
                                </div>

                                <button
                                    className="btn-action-small"
                                    onClick={handleReset}
                                    style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                                >
                                    <FaTrash /> Clear / Upload New
                                </button>
                            </div>

                            {/* Column Mapping Controller */}
                            <div className="mapping-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', marginBottom: '10px' }}>
                                    <FaExchangeAlt style={{ color: '#10b981' }} />
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                                        Map PDF Table Columns to Student Records
                                    </h4>
                                </div>
                                <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '13px' }}>
                                    Select the column index from your PDF table that corresponds to each required database field. Empty mappings will use empty values.
                                </p>

                                <div className="mapping-grid">
                                    {/* Student Name Mapping */}
                                    <div className="mapping-item">
                                        <label>Student Name <span className="required">*</span></label>
                                        <select
                                            className="mapping-select"
                                            value={mappings.stud_name}
                                            onChange={(e) => handleMappingChange('stud_name', e.target.value)}
                                        >
                                            <option value="-1">-- Unmapped --</option>
                                            {columns.map((col, idx) => (
                                                <option key={idx} value={idx}>{`Col ${idx + 1}: ${col || '(No Name)'}`}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Birth Date Mapping */}
                                    <div className="mapping-item">
                                        <label>Birth Date</label>
                                        <select
                                            className="mapping-select"
                                            value={mappings.stud_birth_date}
                                            onChange={(e) => handleMappingChange('stud_birth_date', e.target.value)}
                                        >
                                            <option value="-1">-- Unmapped --</option>
                                            {columns.map((col, idx) => (
                                                <option key={idx} value={idx}>{`Col ${idx + 1}: ${col || '(No Name)'}`}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Gender Mapping */}
                                    <div className="mapping-item">
                                        <label>Gender</label>
                                        <select
                                            className="mapping-select"
                                            value={mappings.stud_gender}
                                            onChange={(e) => handleMappingChange('stud_gender', e.target.value)}
                                        >
                                            <option value="-1">-- Unmapped --</option>
                                            {columns.map((col, idx) => (
                                                <option key={idx} value={idx}>{`Col ${idx + 1}: ${col || '(No Name)'}`}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Father Name Mapping */}
                                    <div className="mapping-item">
                                        <label>Father's Name</label>
                                        <select
                                            className="mapping-select"
                                            value={mappings.stud_father_name}
                                            onChange={(e) => handleMappingChange('stud_father_name', e.target.value)}
                                        >
                                            <option value="-1">-- Unmapped --</option>
                                            {columns.map((col, idx) => (
                                                <option key={idx} value={idx}>{`Col ${idx + 1}: ${col || '(No Name)'}`}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mother Name Mapping */}
                                    <div className="mapping-item">
                                        <label>Mother's Name</label>
                                        <select
                                            className="mapping-select"
                                            value={mappings.stud_mother_name}
                                            onChange={(e) => handleMappingChange('stud_mother_name', e.target.value)}
                                        >
                                            <option value="-1">-- Unmapped --</option>
                                            {columns.map((col, idx) => (
                                                <option key={idx} value={idx}>{`Col ${idx + 1}: ${col || '(No Name)'}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Data Grid Section */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', marginTop: '10px' }}>
                                <FaTable style={{ color: '#10b981' }} />
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Parsed PDF Data Grid</h4>
                                <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>
                                    {rows.length} rows found
                                </span>
                            </div>

                            <div className="table-responsive-container">
                                <table className="data-grid-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                                            {columns.map((col, idx) => {
                                                // Check if mapped to something
                                                let mappingText = '';
                                                if (mappings.stud_name === idx) mappingText = ' (Name)';
                                                else if (mappings.stud_birth_date === idx) mappingText = ' (DOB)';
                                                else if (mappings.stud_gender === idx) mappingText = ' (Gender)';
                                                else if (mappings.stud_father_name === idx) mappingText = ' (Father)';
                                                else if (mappings.stud_mother_name === idx) mappingText = ' (Mother)';

                                                return (
                                                    <th key={idx}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span>{col || `Column ${idx + 1}`}</span>
                                                            {mappingText && (
                                                                <span style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>
                                                                    {mappingText}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                            <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
                                                    {rIdx + 1}
                                                </td>
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx}>
                                                        <input
                                                            type="text"
                                                            className="cell-editable"
                                                            value={cell || ''}
                                                            onChange={(e) => handleCellEdit(rIdx, cIdx, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-delete-row"
                                                        onClick={() => deleteRow(rIdx)}
                                                        title="Delete Row"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="table-controls">
                                <button
                                    className="btn-action-small"
                                    onClick={addRow}
                                    style={{ color: '#10b981', borderColor: '#10b981' }}
                                >
                                    <FaPlus /> Add New Row
                                </button>

                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Double-click or click inside any cell to modify values before saving.
                                </span>
                            </div>

                            {/* Form Buttons */}
                            <div className="form-buttons" style={{ marginTop: '40px' }}>
                                <button
                                    className="btn btn-submit"
                                    onClick={insertToDatabase}
                                    disabled={isSaving}
                                    style={{ flex: 2 }}
                                >
                                    {isSaving ? <span className="spinner"></span> : <><FaSave /> Save Student Profiles to Database</>}
                                </button>

                                <button
                                    className="btn btn-reset"
                                    onClick={handleReset}
                                    disabled={isSaving}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Convert_pdf_to_Table;