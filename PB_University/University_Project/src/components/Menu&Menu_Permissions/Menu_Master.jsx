import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Searchtrums from '../Type&search/Searchtrums';

function Menu_Master() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editingId = searchParams.get('id');
    const viewingId = searchParams.get('viewid');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id;
    const activeId = editingId || viewingId;

    const [formData, setFormData] = useState({
        menu_name: '',
        parent_menu: '',
        menu_path: '',
        menu_icon: '',
        menu_status: 1
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [isFetchingRecord, setIsFetchingRecord] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(editingId);
    const isViewMode = Boolean(viewingId);
    const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

    // Fetch Menu details for Edit/View
    useEffect(() => {
        let isActive = true;
        const loadMenu = async () => {
            if (!activeId) {
                resetForm();
                return;
            }
            setIsFetchingRecord(true);
            try {
                const response = await api.get('api/menu_master_Contoller/menu_master_select_by_id', {
                    params: { id: activeId, create_By: userid }
                });

                let payload = response.data;
                if (typeof payload === 'string') payload = JSON.parse(payload);

                if (!isActive) return;

                const record = Array.isArray(payload?.Result) && payload.Result.length > 0 ? payload.Result[0] : null;

                if (!record) {
                    setSubmitStatus({ type: 'error', message: `No menu found for ID ${activeId}` });
                    return;
                }

                const statusVal = record?.mm_is_status ?? record?.Status;
                let parsedStatus = 1;
                if (statusVal !== undefined && statusVal !== null) {
                    if (String(statusVal).toLowerCase() === 'inactive') parsedStatus = 0;
                    else if (String(statusVal).toLowerCase() === 'active') parsedStatus = 1;
                    else parsedStatus = Number(statusVal);
                }

                setFormData({
                    menu_name: record?.mm_menu_name ?? '',
                    parent_menu: record?.mm_parent_menu_id ?? '',
                    menu_path: record?.mm_menu_path ?? '',
                    menu_icon: record?.mm_menu_icon ?? '',
                    menu_status: parsedStatus
                });
            } catch (err) {
                if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
            } finally {
                if (isActive) setIsFetchingRecord(false);
            }
        };
        loadMenu();
        return () => { isActive = false; };
    }, [activeId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.menu_name.trim()) newErrors.menu_name = 'Menu Name is required';
        if (!formData.menu_path.trim()) newErrors.menu_path = 'Menu Path is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = (preserveStatus = false) => {
        setFormData({
            menu_name: '',
            parent_menu: '',
            menu_path: '',
            menu_icon: '',
            menu_status: 1
        });
        if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload = new URLSearchParams();
        payload.append('mm_id', activeId || '0');
        payload.append('create_by', userid || '0');
        payload.append('mm_menu_name', formData.menu_name.trim());
        payload.append('mm_parent_menu_id', formData.parent_menu || '0');
        payload.append('mm_menu_path', formData.menu_path.trim());
        payload.append('mm_menu_icon', formData.menu_icon.trim());
        payload.append('mm_is_status', String(formData.menu_status));

        try {
            let response;
            if (isEditMode) {
                response = await api.post('api/menu_master_Contoller/menu_master_update', payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
            } else {
                response = await api.post('api/menu_master_Contoller/menu_master_insert', payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
            }

            const data = response.data;

            if (data.Status === 1) {
                Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated' : 'Saved',
                    text: data.Message || 'Menu information processed successfully!'
                });
                if (!isEditMode) resetForm(true);
                navigate(`/List_menu_master`, { state: { hasLoaded: true } });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Info',
                    text: data.Message || 'Menu already exists or could not be saved.'
                });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'An error occurred while saving.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="student-form-container">
            <div className="form-card">
                <div className="form-header">
                    <h2>
                        {isViewMode ? 'View Menu Details' : isEditMode ? 'Edit Menu' : 'Menu Master'}
                    </h2>
                    <p>
                        {isViewMode ? 'Viewing recorded information' : 'Manage menu information here.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="student-form">

                    {/* Menu Name Input */}
                    <div className="form-group">
                        <label>Menu Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="menu_name"
                            value={formData.menu_name}
                            onChange={handleChange}
                            placeholder="Enter menu name"
                            className={`form-input ${errors.menu_name ? 'input-error' : ''}`}
                            disabled={isFieldDisabled}
                        />
                        {errors.menu_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.menu_name}</span>}
                    </div>

                    {/* Parent Menu Input */}
                    <div className="form-group">
                        <label>Parent Menu</label>
                        <Searchtrums
                            name="parent_menu"
                            value={formData.parent_menu}
                            onChange={handleChange}
                            disabled={isFieldDisabled}
                            placeholder="Select Parent Menu"
                            apiUrl={`api/menu_master_Contoller/parent_menu_master_search`}
                            idField="pmm_id"
                            nameField="pmm_menu_name"
                            searchParamName="searchtrums"
                        />
                    </div>

                    {/* Menu Path Input */}
                    <div className="form-group">
                        <label>Menu Path <span className="required">*</span></label>
                        <input
                            type="text"
                            name="menu_path"
                            value={formData.menu_path}
                            onChange={handleChange}
                            placeholder="e.g. /dashboard or /settings"
                            className={`form-input ${errors.menu_path ? 'input-error' : ''}`}
                            disabled={isFieldDisabled}
                        />
                        {errors.menu_path && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.menu_path}</span>}
                    </div>

                    {/* Menu Icon Input */}
                    <div className="form-group">
                        <label>Menu Icon</label>
                        <input
                            type="text"
                            name="menu_icon"
                            value={formData.menu_icon}
                            onChange={handleChange}
                            placeholder="e.g. fa fa-home or icon-name"
                            className="form-input"
                            disabled={isFieldDisabled}
                        />
                    </div>

                    {/* Status Checkbox */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <span>Status: {formData.menu_status === 1}</span>
                            <input
                                type="checkbox"
                                name="menu_status"
                                checked={formData.menu_status === 1}
                                onChange={handleChange}
                                disabled={isFieldDisabled}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </label>
                    </div>

                    {submitStatus.message && (
                        <div className={`status-message ${submitStatus.type}`}>{submitStatus.message}</div>
                    )}

                    <div className="form-buttons">
                        {!isViewMode && (
                            <button type="submit" className="btn btn-submit" disabled={isFieldDisabled}>
                                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Menu' : 'Save Menu')}
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-reset"
                            disabled={isSubmitting}
                            onClick={() => navigate('/List_menu_master',{ state: { hasLoaded: true } })}
                        >
                            {isViewMode ? 'Back to List' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Menu_Master;