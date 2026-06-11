import React, { useState, useEffect, useRef } from 'react';
import api from '../back_end_url/api_url';

function Searchtrums({
    name,
    value,
    onChange,
    disabled,
    placeholder,
    apiUrl,
    idField = "cm_id",
    nameField = "Country Name",
    apiParams = {},
    searchParamName = "search_text",
    displayValue = ""
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = storedUser.um_id || 0;

    useEffect(() => {
        if (displayValue) {
            setSearchTerm(displayValue);
        }
    }, [displayValue]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Resolve initial name if value exists
    useEffect(() => {
        const resolveInitialName = async () => {
            if (displayValue) return;
            if (value && !showDropdown && apiUrl) {
                try {
                    // We pass "%" to fetch all or use the API to find the record
                    const params = { create_By: userid, ...apiParams, [searchParamName]: '%' };
                    const { data: payload } = await api.get(apiUrl, { params });
                    const records = Array.isArray(payload?.Result) ? payload.Result : (Array.isArray(payload) ? payload : []);
                    const record = records.find(r => String(r[idField]) === String(value));
                    if (record) {
                        setSearchTerm(record[nameField] || '');
                    }
                } catch (error) {
                    console.error("Error resolving initial name", error);
                }
            } else if (!value) {
                setSearchTerm('');
            }
        };
        resolveInitialName();
    }, [value, apiUrl, idField, nameField, userid]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchResults = async (query) => {
        if (!apiUrl) return;
        setIsLoading(true);
        try {
            // Pass the query as a parameter to the API
            const params = { create_By: userid, ...apiParams, [searchParamName]: query };

            const { data: payload } = await api.get(apiUrl, { params });

            const records = Array.isArray(payload?.Result) ? payload.Result : (Array.isArray(payload) ? payload : []);

            const formattedRecords = records.map((record) => ({
                id: record[idField],
                name: record[nameField] || "",
                original: record
            }));

            setResults(formattedRecords);
            setActiveIndex(-1);
            setShowDropdown(true);
        } catch (error) {
            console.error("Error fetching search terms:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        // Clear the actual form value when typing to invalidate previous selection
        if (value) {
            onChange({ target: { name, value: '' } });
        }

        if (query === '%' || query.trim().length >= 1) {
            fetchResults(query);
        } else {
            setResults([]);
            setShowDropdown(false);
            setActiveIndex(-1);
        }
    };

    const handleSelect = (item) => {
        setSearchTerm(item.name);
        setShowDropdown(false);
        // Trigger the onChange for the parent component to update its state with the ID
        onChange({ target: { name, value: item.id, item: item.original } });
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onClick={() => {
                    // Show dropdown if they click and already typed something
                    if (searchTerm === '%' || searchTerm.trim().length >= 1) {
                        fetchResults(searchTerm);
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                        if (!showDropdown) {
                            if (searchTerm === '%' || searchTerm.trim().length >= 1) {
                                fetchResults(searchTerm);
                            }
                        } else if (results.length > 0) {
                            e.preventDefault();
                            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                        }
                    } else if (e.key === 'ArrowUp') {
                        if (showDropdown && results.length > 0) {
                            e.preventDefault();
                            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
                        }
                    } else if (e.key === 'Enter') {
                        if (showDropdown && activeIndex >= 0 && activeIndex < results.length) {
                            e.preventDefault();
                            handleSelect(results[activeIndex]);
                        }
                    }
                }}
                className="form-input"
                disabled={disabled}
                placeholder={placeholder}
                autoComplete="off"
                style={{ paddingRight: '30px' }}
            />

            {searchTerm && !disabled && (
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm('');
                        setResults([]);
                        setShowDropdown(false);
                        setActiveIndex(-1);
                        onChange({ target: { name, value: '', item: null } });
                    }}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        userSelect: 'none',
                        zIndex: 2
                    }}
                    title="Clear"
                >
                    &times;
                </span>
            )}

            {isLoading && <div style={{ position: 'absolute', right: searchTerm ? '30px' : '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#888', zIndex: 2 }}>Loading...</div>}

            {showDropdown && results.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {results.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                color: '#333',
                                backgroundColor: index === activeIndex ? '#e6f7ff' : 'white'
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}

            {showDropdown && results.length === 0 && !isLoading && searchTerm.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    color: '#888'
                }}>
                    No results found
                </div>
            )}
        </div>
    );
}

export default Searchtrums;