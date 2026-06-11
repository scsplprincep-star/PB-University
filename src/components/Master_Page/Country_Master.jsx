import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';

const hasValidId = (value) => value !== null && value !== undefined && value !== '';

function Country_Master() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editingId = searchParams.get('id');
    const viewingId = searchParams.get('viewid');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id;
    const activeId = editingId || viewingId;

    const [formData, setFormData] = useState({
        country_name: '',
        country_status: 1 // 1 for Active, 0 for Inactive
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [countryId, setCountryId] = useState(null);
    const [isFetchingRecord, setIsFetchingRecord] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(editingId);
    const isViewMode = Boolean(viewingId);
    const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

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
        if (!formData.country_name.trim()) {
            newErrors.country_name = 'Country Name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = (preserveStatus = false) => {
        setFormData({
            country_name: '',
            country_status: 1
        });
        if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
    };

    useEffect(() => {
        let isActive = true;
        const loadCountry = async () => {
            if (!activeId) {
                setCountryId(null);
                resetForm();
                return;
            }
            setIsFetchingRecord(true);
            try {
                // Updated API path for Country Master
                const response = await api.get('api/country_master_Contoller/country_master_select_by_id', {
                    params: { cm_id: activeId, create_By: userid }
                });

                let payload = response.data;
                if (typeof payload === 'string') payload = JSON.parse(payload);

                if (!isActive) return;

                const record = Array.isArray(payload?.Result) && payload.Result.length > 0 ? payload.Result[0] : null;

                if (!record) {
                    setSubmitStatus({ type: 'error', message: `No country found for ID ${activeId}` });
                    return;
                }

                setCountryId(record?.country_id ?? Number(activeId));
                setFormData({
                    country_name: record?.cm_country_name ?? '',
                    country_status: record?.cm_is_status ?? 1 ?? 0
                });
            } catch (err) {
                if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
            } finally {
                if (isActive) setIsFetchingRecord(false);
            }
        };
        loadCountry();
        return () => { isActive = false; };
    }, [activeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload = new URLSearchParams();
        payload.append('cm_id', activeId || '0');
        payload.append('cm_country_name', formData.country_name.trim());
        payload.append('cm_is_status', String(formData.country_status));
        payload.append('create_by', userid || '0');

        try {
            let response;
            if (isEditMode) {
                response = await api.post('api/country_master_Contoller/country_master_update', payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
            } else {
                response = await api.post('api/country_master_Contoller/i_country_master_insert', payload, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
            }

            const data = response.data;

            if (data.Status === 1) {
                Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated' : 'Saved',
                    text: data.Message || 'Country information processed successfully!'
                });
                if (!isEditMode) resetForm(true);
                navigate(`/List_country_master`, { state: { hasLoaded: true } });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Info',
                    text: data.Message || 'Country already exists or could not be saved.'
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
                        {isViewMode ? 'View Country Details' : isEditMode ? 'Edit Country' : 'Country Master'}
                    </h2>
                    <p>
                        {isViewMode ? 'Viewing recorded information' : 'Manage country information here.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="student-form">
                    {/* Country Name Textbox */}
                    <div className="form-group">
                        <label>Country Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="country_name"
                            value={formData.country_name}
                            onChange={handleChange}
                            placeholder="Enter country name"
                            className={`form-input ${errors.country_name ? 'input-error' : ''}`}
                            disabled={isFieldDisabled}
                        />
                        {errors.country_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.country_name}</span>}
                    </div>

                    {/* Status Checkbox */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <span>Status</span>
                            <input
                                type="checkbox"
                                name="country_status"
                                checked={formData.country_status === 1}
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
                                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Country' : 'Save Country')}
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-reset"
                            disabled={isSubmitting}
                            onClick={() => navigate('/list_country_master', { state: { hasLoaded: true } })}
                        >
                            {isViewMode ? 'Back to List' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Country_Master;