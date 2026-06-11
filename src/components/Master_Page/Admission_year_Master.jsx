import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css'; // Using your existing CSS
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Admission_year_Master() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editingId = searchParams.get('id');
  const viewingId = searchParams.get('viewid');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userid = searchParams.get('userId') || storedUser.um_id;
  const activeId = editingId || viewingId;

  const [formData, setFormData] = useState({
    admission_year: '',
    ay_status: 1 // 1 for Active, 0 for Inactive
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isFetchingRecord, setIsFetchingRecord] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(editingId);
  const isViewMode = Boolean(viewingId);
  const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

  // Fetch Admission Year details for Edit/View
  useEffect(() => {
    let isActive = true;
    const loadAdmissionYear = async () => {
      if (!activeId) {
        resetForm();
        return;
      }
      setIsFetchingRecord(true);
      try {
        // Adjust the endpoint URL as per your actual backend controller
        const response = await api.get('/api/Admission_Year_Master_Contoller/admission_year_master_select_by_id', {
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
          admission_year: record?.aym_admission_year ?? '',
          ay_status: record?.status ?? 1
        });
      } catch (err) {
        if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
      } finally {
        if (isActive) setIsFetchingRecord(false);
      }
    };
    loadAdmissionYear();
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
    if (!formData.admission_year.trim()) {
      newErrors.admission_year = 'Admission Year is required';
    } else if (!/^\d{4}$|^\d{4}-\d{2,4}$/.test(formData.admission_year)) {
      // Basic validation for year format like 2024 or 2024-25
      newErrors.admission_year = 'Please enter a valid year format (e.g., 2024 or 2024-25)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = (preserveStatus = false) => {
    setFormData({
      admission_year: '',
      ay_status: 1
    });
    if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = new URLSearchParams();
    payload.append('aym_id', activeId || '0');
    payload.append('create_By', userid || '0');
    payload.append('aym_admission_year', formData.admission_year);
    payload.append('aym_is_status', String(formData.ay_status));

    try {
      // Adjust the endpoint URL as per your actual backend controller
      const response = await api.post('/api/Admission_Year_Master_Contoller/admission_year_master_insert_update', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = response.data;

      if (data.Status === 1) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Updated' : 'Saved',
          text: data.Message || 'Admission Year processed successfully!'
        });
        if (!isEditMode) resetForm(true);
        navigate(`/List_Admission_year_Master`, { state: { hasLoaded: true } }); // Adjust list route as needed
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
            {isViewMode ? 'View Admission Year' : isEditMode ? 'Edit Admission Year' : 'Admission Year Page'}
          </h2>
          <p>
            {isViewMode ? 'Viewing recorded information' : 'Manage admission years here.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="student-form">

          {/* Admission Year Input */}
          <div className="form-group">
            <label>Admission Year <span className="required">*</span></label>
            <input
              type="text"
              name="admission_year"
              value={formData.admission_year}
              onChange={handleChange}
              placeholder="Enter Admission Year"
              className={`form-input ${errors.admission_year ? 'input-error' : ''}`}
              disabled={isFieldDisabled}
            />
            {errors.admission_year && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.admission_year}</span>}
          </div>

          {/* Status Checkbox */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span>Status</span>
              <input
                type="checkbox"
                name="ay_status"
                checked={formData.ay_status === 1}
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
                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Year' : 'Save Year')}
              </button>
            )}

            <button
              type="button"
              className="btn btn-reset"
              disabled={isSubmitting}
              onClick={() => navigate('/List_Admission_year_Master', { state: { hasLoaded: true } })}
            >
              {isViewMode ? 'Back to List' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admission_year_Master;