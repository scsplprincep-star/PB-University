import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Searchtrums from '../Type&search/Searchtrums';

function State_Master() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editingId = searchParams.get('id');
  const viewingId = searchParams.get('viewid');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userid = searchParams.get('userId') || storedUser.um_id;
  const activeId = editingId || viewingId;

  const [formData, setFormData] = useState({
    state_name: '',
    country_id: '',
    state_status: 1 // 1 for Active, 0 for Inactive
  });

  const [countries, setCountries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isFetchingRecord, setIsFetchingRecord] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(editingId);
  const isViewMode = Boolean(viewingId);
  const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;


  // Fetch State details for Edit/View
  useEffect(() => {
    let isActive = true;
    const loadState = async () => {
      if (!activeId) {
        resetForm();
        return;
      }
      setIsFetchingRecord(true);
      try {
        const response = await api.get('api/state_master_Contoller/state_master_select_by_id', {
          params: { id: activeId, create_By: userid }
        });

        let payload = response.data;
        if (typeof payload === 'string') payload = JSON.parse(payload);

        if (!isActive) return;

        const record = Array.isArray(payload?.Result) && payload.Result.length > 0 ? payload.Result[0] : null;

        if (!record) {
          setSubmitStatus({ type: 'error', message: `No state found for ID ${activeId}` });
          return;
        }

        setFormData({
          state_name: record?.sm_state_name ?? '',
          country_id: record?.sm_country_id ?? '',
          state_status: record?.sm_is_status ?? 1
        });
      } catch (err) {
        if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
      } finally {
        if (isActive) setIsFetchingRecord(false);
      }
    };
    loadState();
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
    if (!formData.country_id) {
      newErrors.country_id = 'Country Name is required';
    }
    if (!formData.state_name.trim()) {
      newErrors.state_name = 'State Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = (preserveStatus = false) => {
    setFormData({
      state_name: '',
      country_id: '',
      state_status: 1
    });
    if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = new URLSearchParams();
    payload.append('sm_id', activeId || '0');
    payload.append('create_by', userid || '0');
    payload.append('sm_country_id', formData.country_id);
    payload.append('sm_state_name', formData.state_name.trim());
    payload.append('sm_is_status', String(formData.state_status));

    try {
      let response;
      if (isEditMode) {
        response = await api.post('api/state_master_Contoller/state_master_update', payload, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      } else {
        response = await api.post('api/state_master_Contoller/state_master_insert', payload, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      }

      const data = response.data;

      if (data.Status === 1) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Updated' : 'Saved',
          text: data.Message || 'State information processed successfully!'
        });
        if (!isEditMode) resetForm(true);
        navigate(`/List_state_master`, { state: { hasLoaded: true } });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Info',
          text: data.Message || 'State already exists or could not be saved.'
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
            {isViewMode ? 'View State Details' : isEditMode ? 'Edit State' : 'State Master'}
          </h2>
          <p>
            {isViewMode ? 'Viewing recorded information' : 'Manage state information here.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="student-form">

          {/* Country Dropdown */}
          <div className="form-group">
            <label>Country Name <span className="required">*</span></label>
            <Searchtrums
              name="country_id"
              value={formData.country_id}
              onChange={handleChange}
              disabled={isFieldDisabled}
              placeholder="select your country"
              apiUrl="api/new_student_details_contoller/country_master_search"
              idField="cm_id"
              nameField="cm_country_name"
              searchParamName="searchtrums"
              className={errors.country_id ? 'input-error' : ''}
            />
            {errors.country_id && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.country_id}</span>}
          </div>

          {/* State Name Input */}
          <div className="form-group">
            <label>State Name <span className="required">*</span></label>
            <input
              type="text"
              name="state_name"
              value={formData.state_name}
              onChange={handleChange}
              placeholder="Enter state name"
              className={`form-input ${errors.state_name ? 'input-error' : ''}`}
              disabled={isFieldDisabled}
            />
            {errors.state_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.state_name}</span>}
          </div>

          {/* Status Checkbox */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span>Status</span>
              <input
                type="checkbox"
                name="state_status"
                checked={formData.state_status === 1}
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
                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update State' : 'Save State')}
              </button>
            )}

            <button
              type="button"
              className="btn btn-reset"
              disabled={isSubmitting}
              onClick={() => navigate('/List_state_master', { state: { hasLoaded: true } })}
            >
              {isViewMode ? 'Back to List' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default State_Master;