import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Parent_menu_master() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editingId = searchParams.get('id');
    const viewingId = searchParams.get('viewid');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id;
    const activeId = editingId || viewingId;

    const [formData, setFormData] = useState({
        parent_menu_name: '',
        parent_menu_icon: '',
        parent_menu_status: 1
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [isFetchingRecord, setIsFetchingRecord] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(editingId);
    const isViewMode = Boolean(viewingId);
    const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

    // Fetch Parent Menu details for Edit/View
    useEffect(() => {
        let isActive = true;
        const loadParentMenu = async () => {
            if (!activeId) {
                resetForm();
                return;
            }
            setIsFetchingRecord(true);
            try {
                // Adjusting API endpoint to parent_menu_master logic
                const response = await api.get('api/parent_menu_master_Contoller/parent_menu_master_by_id', {
                    params: { id: activeId, create_By: userid }
                });

                let payload = response.data;
                if (typeof payload === 'string') payload = JSON.parse(payload);

                if (!isActive) return;

                const record = Array.isArray(payload?.Result) && payload.Result.length > 0 ? payload.Result[0] : null;

                if (!record) {
                    setSubmitStatus({ type: 'error', message: `No parent menu found for ID ${activeId}` });
                    return;
                }

                const statusVal = record?.pmm_is_status ?? record?.Status;
                let parsedStatus = 1;
                if (statusVal !== undefined && statusVal !== null) {
                    if (String(statusVal).toLowerCase() === 'inactive') parsedStatus = 0;
                    else if (String(statusVal).toLowerCase() === 'active') parsedStatus = 1;
                    else parsedStatus = Number(statusVal);
                }

                setFormData({
                    parent_menu_name: record?.pmm_menu_name ?? '',
                    parent_menu_icon: record?.pmm_menu_icon ?? '',
                    parent_menu_status: parsedStatus
                });
            } catch (err) {
                if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
            } finally {
                if (isActive) setIsFetchingRecord(false);
            }
        };
        loadParentMenu();
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
        if (!formData.parent_menu_name.trim()) newErrors.parent_menu_name = 'Parent Menu Name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = (preserveStatus = false) => {
        setFormData({
            parent_menu_name: '',
            parent_menu_icon: '',
            parent_menu_status: 1
        });
        if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload = new URLSearchParams();
        payload.append('pmm_id', activeId || '0');
        payload.append('create_by', userid || '0');
        payload.append('pmm_menu_name', formData.parent_menu_name.trim());
        payload.append('pmm_menu_icon', formData.parent_menu_icon.trim());
        payload.append('pmm_is_status', String(formData.parent_menu_status));

        try {
            let response;
            if (isEditMode) {
                response = await api.post('api/parent_menu_master_Contoller/parent_menu_master_update', payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
            } else {
                response = await api.post('api/parent_menu_master_Contoller/parent_menu_master_insert', payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
            }

            const data = response.data;

            if (data.Status === 1) {
                Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated' : 'Saved',
                    text: data.Message || 'Parent Menu information processed successfully!'
                });
                if (!isEditMode) resetForm(true);
                navigate(`/List_parent_menu_master`, { state: { hasLoaded: true } });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Info',
                    text: data.Message || 'Parent Menu already exists or could not be saved.'
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
                        {isViewMode ? 'View Parent Menu' : isEditMode ? 'Edit Parent Menu' : 'Parent Menu Master'}
                    </h2>
                    <p>
                        {isViewMode ? 'Viewing recorded information' : 'Manage parent menu information here.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="student-form">

                    {/* Parent Menu Name Input */}
                    <div className="form-group">
                        <label>Parent Menu Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="parent_menu_name"
                            value={formData.parent_menu_name}
                            onChange={handleChange}
                            placeholder="Enter parent menu name"
                            className={`form-input ${errors.parent_menu_name ? 'input-error' : ''}`}
                            disabled={isFieldDisabled}
                        />
                        {errors.parent_menu_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.parent_menu_name}</span>}
                    </div>

                    {/* Parent Menu Icon Input */}
                    <div className="form-group">
                        <label>Parent Menu Icon</label>
                        <input
                            type="text"
                            name="parent_menu_icon"
                            value={formData.parent_menu_icon}
                            onChange={handleChange}
                            placeholder="e.g. fa fa-folder or icon-name"
                            className="form-input"
                            disabled={isFieldDisabled}
                        />
                    </div>

                    {/* Parent Menu Status Checkbox */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <span>Parent Menu Status: {formData.parent_menu_status === 1 ? 'Active' : 'Inactive'}</span>
                            <input
                                type="checkbox"
                                name="parent_menu_status"
                                checked={formData.parent_menu_status === 1}
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
                                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Parent Menu' : 'Save Parent Menu')}
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-reset"
                            disabled={isSubmitting}
                            onClick={() => navigate('/List_parent_menu_master', { state: { hasLoaded: true } })}
                        >
                            {isViewMode ? 'Back to List' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Parent_menu_master;