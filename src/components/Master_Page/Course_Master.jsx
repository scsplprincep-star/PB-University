import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Course_Master() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editingId = searchParams.get('id');
  const viewingId = searchParams.get('viewid');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userid = searchParams.get('userId') || storedUser.um_id;
  const activeId = editingId || viewingId;

  const [formData, setFormData] = useState({
    Course_name: '',
    Course_code: '',
    duration: '',
    pm_status: 1 // 1 for Active, 0 for Inactive
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isFetchingRecord, setIsFetchingRecord] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(editingId);
  const isViewMode = Boolean(viewingId);
  const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

  // Fetch Course details for Edit/View
  useEffect(() => {
    let isActive = true;
    const loadCourse = async () => {
      if (!activeId) {
        resetForm();
        return;
      }
      setIsFetchingRecord(true);
      try {
        // Ensure this endpoint matches your backend API controller name
        const response = await api.get('/api/course_master_Contoller/course_master_select_all_by_id', {
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
          Course_name: record?.cm_course_name ?? '',
          Course_code: record?.cm_course_code ?? '',
          duration: record?.cm_duration_year ?? '',
          pm_status: record?.cm_is_status ?? 1
        });
      } catch (err) {
        if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
      } finally {
        if (isActive) setIsFetchingRecord(false);
      }
    };
    loadCourse();
    return () => { isActive = false; };
  }, [activeId, userid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let fieldValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    // Only allow numbers for duration
    if (name === "duration") {
      fieldValue = value.replace(/\D/g, "");
    }

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Course_name.trim()) {
      newErrors.Course_name = 'Course Name is required';
    }
    if (!formData.Course_code.trim()) {
      newErrors.Course_code = 'Course Code is required';
    }
    if (!formData.duration.toString().trim()) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(formData.duration) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = (preserveStatus = false) => {
    setFormData({
      Course_name: '',
      Course_code: '',
      duration: '',
      pm_status: 1
    });
    if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = new URLSearchParams();
    payload.append('cm_id', activeId || '0');
    payload.append('create_By', userid || '0');
    payload.append('cm_course_name', formData.Course_name);
    payload.append('cm_course_code', formData.Course_code);
    payload.append('cm_duration_year', formData.duration);
    payload.append('cm_is_status', String(formData.pm_status));

    try {
      // Ensure this endpoint matches your backend API controller name
      const response = await api.post('/api/course_master_Contoller/course_master_insert_update', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = response.data;

      if (data.Status === 1) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Updated' : 'Saved',
          text: data.Message || 'Course processed successfully!'
        });
        if (!isEditMode) resetForm(true);
        navigate(`/List_Course_Master`, { state: { hasLoaded: true } });
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
            {isViewMode ? 'View Course' : isEditMode ? 'Edit Course' : 'Course Master Page'}
          </h2>
          <p>
            {isViewMode ? 'Viewing recorded information' : 'Manage Courses here.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="student-form">

          {/* Course Name Input */}
          <div className="form-group">
            <label>Course Name <span className="required">*</span></label>
            <input
              type="text"
              name="Course_name"
              value={formData.Course_name}
              onChange={handleChange}
              placeholder="Enter Course  Name"
              className={`form-input ${errors.Course_name ? 'input-error' : ''}`}
              disabled={isFieldDisabled}
            />
            {errors.Course_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.Course_name}</span>}
          </div>

          {/* Course Code Input */}
          <div className="form-group">
            <label>Course Code <span className="required">*</span></label>
            <input
              type="text"
              name="Course_code"
              value={formData.Course_code}
              onChange={handleChange}
              placeholder="Enter Course Code"
              className={`form-input ${errors.Course_code ? 'input-error' : ''}`}
              disabled={isFieldDisabled}
            />
            {errors.Course_code && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.Course_code}</span>}
          </div>

          {/* Duration Input */}
          <div className="form-group">
            <label>Duration (in Years) <span className="required">*</span></label>
            <input
              type="text"
              inputMode="numeric"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Enter Duration"
              className={`form-input ${errors.duration ? 'input-error' : ''}`}
              disabled={isFieldDisabled}
            />
            {errors.duration && (<span className="error-text" style={{ color: "red", fontSize: "12px" }}>{errors.duration}</span>)}
          </div>

          {/* Status Checkbox */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span>Status</span>
              <input
                type="checkbox"
                name="pm_status"
                checked={formData.pm_status === 1}
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
                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Course' : 'Save Course')}
              </button>
            )}

            <button
              type="button"
              className="btn btn-reset"
              disabled={isSubmitting}
              onClick={() => navigate('/List_Course_Master', { state: { hasLoaded: true } })}
            >
              {isViewMode ? 'Back to List' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Course_Master;