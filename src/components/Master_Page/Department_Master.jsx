import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css'; // Using your existing CSS
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Department_Master() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editingId = searchParams.get('id');
    const viewingId = searchParams.get('viewid');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id;
    const activeId = editingId || viewingId;

    const [formData, setFormData] = useState({
        department_name: '',
        dm_status: 1 // 1 for Active, 0 for Inactive
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [isFetchingRecord, setIsFetchingRecord] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(editingId);
    const isViewMode = Boolean(viewingId);
    const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

    // Fetch Department details for Edit/View
    useEffect(() => {
        let isActive = true;
        const loadDepartment = async () => {
            if (!activeId) {
                resetForm();
                return;
            }
            setIsFetchingRecord(true);
            try {
                // Endpoint updated for Department Master
                const response = await api.get('/api/department_master_Contoller/department_master_select_by_id', {
                    params: { id: activeId, create_By: userid }
                });

                let payload = response.data;
                if (typeof payload === 'string') payload = JSON.parse(payload);

                if (!isActive) return;

                const record = Array.isArray(payload?.Result) && payload.Result.length > 0 ? payload.Result[0] : null;

                if (!record) {
                    setSubmitStatus({ type: 'error', message: `No record found for ID ${activeId}` });
                    return;
                }

                setFormData({
                    department_name: record?.dm_department_name ?? '',
                    dm_status: record?.status ?? 1
                });
            } catch (err) {
                if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
            } finally {
                if (isActive) setIsFetchingRecord(false);
            }
        };
        loadDepartment();
        return () => { isActive = false; };
    }, [activeId, userid]);

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
        if (!formData.department_name.trim()) {
            newErrors.department_name = 'Department Name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = (preserveStatus = false) => {
        setFormData({
            department_name: '',
            dm_status: 1
        });
        if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload = new URLSearchParams();
        payload.append('dm_id', activeId || '0');
        payload.append('create_By', userid || '0');
        payload.append('dm_department_name', formData.department_name);
        payload.append('dm_is_status', String(formData.dm_status));

        try {
            // Endpoint updated for Department Master
            const response = await api.post('/api/department_master_Contoller/department_master_insert_update', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const data = response.data;

            if (data.Status === 1) {
                Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated' : 'Saved',
                    text: data.Message || 'Department processed successfully!'
                });
                if (!isEditMode) resetForm(true);
                navigate(`/List_Department_Master`, { state: { hasLoaded: true } });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Info',
                    text: data.Message || 'Record already exists or could not be saved.'
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
                        {isViewMode ? 'View Department' : isEditMode ? 'Edit Department' : 'Department Master Page'}
                    </h2>
                    <p>
                        {isViewMode ? 'Viewing recorded information' : 'Manage departments here.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="student-form">

                    {/* Department Name Input */}
                    <div className="form-group">
                        <label>Department Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="department_name"
                            value={formData.department_name}
                            onChange={handleChange}
                            placeholder="Enter Department Name"
                            className={`form-input ${errors.department_name ? 'input-error' : ''}`}
                            disabled={isFieldDisabled}
                        />
                        {errors.department_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.department_name}</span>}
                    </div>

                    {/* Status Checkbox */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <span>Status</span>
                            <input
                                type="checkbox"
                                name="dm_status"
                                checked={formData.dm_status === 1}
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
                                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Department' : 'Save Department')}
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-reset"
                            disabled={isSubmitting}
                            onClick={() => navigate('/List_Department_Master', { state: { hasLoaded: true } })}
                        >
                            {isViewMode ? 'Back to List' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Department_Master;