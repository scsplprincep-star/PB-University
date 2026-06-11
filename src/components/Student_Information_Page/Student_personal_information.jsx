import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url'; // Ensure this path is correct
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const parseGenderValue = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '';
  return numeric === 1 || numeric === 2 ? numeric : '';
};

const hasValidId = (value) => value !== null && value !== undefined && value !== '';

function Student_personal_information() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editingId = searchParams.get('id');
  const viewingId = searchParams.get('viewid');
  const userid = searchParams.get('userId') || localStorage.getItem('userId');
  const activeId = editingId || viewingId;

  const [formData, setFormData] = useState({
    stud_name: '',
    stud_birth_date: '',
    stud_gender: '',
    stud_father_name: '',
    stud_mother_name: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [studentId, setStudentId] = useState(null);
  const [isFetchingRecord, setIsFetchingRecord] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(editingId);
  const isViewMode = Boolean(viewingId);
  const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleGenderChange = (e) => {
    setFormData(prev => ({ ...prev, stud_gender: parseInt(e.target.value, 10) }));
    if (errors.stud_gender) setErrors(prev => ({ ...prev, stud_gender: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.stud_name.trim()) newErrors.stud_name = 'Student Name is required';
    if (!formData.stud_birth_date) newErrors.stud_birth_date = 'Birth Date is required';
    if (!formData.stud_gender) newErrors.stud_gender = 'Gender is required';
    if (!formData.stud_father_name.trim()) newErrors.stud_father_name = "Father's Name is required";
    if (!formData.stud_mother_name.trim()) newErrors.stud_mother_name = "Mother's Name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = (preserveStatus = false) => {
    setFormData({
      stud_name: '',
      stud_birth_date: '',
      stud_gender: '',
      stud_father_name: '',
      stud_mother_name: ''
    });
    if (!preserveStatus) setSubmitStatus({ type: '', message: '' });
  };

  useEffect(() => {
    let isActive = true;
    const loadStudent = async () => {
      if (!activeId) {
        setStudentId(null);
        resetForm();
        return;
      }
      setIsFetchingRecord(true);
      try {
        const response = await api.get('api/student_personal_information_insert/student_personal_information_select_by_id', {
          params: { id: activeId }
        });
        let payload = response.data;
        if (typeof payload === 'string') payload = JSON.parse(payload);
        if (!isActive) return;
        const record = Array.isArray(payload?.Result) && payload.Result.length > 0 ? payload.Result[0] : null;
        if (!record) {
          setSubmitStatus({ type: 'error', message: `No student found for ID ${activeId}` });
          return;
        }
        setStudentId(record?.stud_id ?? Number(activeId));
        setFormData({
          stud_name: record?.['Student Name'] ?? record?.stud_name ?? '',
          stud_birth_date: toInputDate(record?.['Student Birth Date'] ?? record?.stud_birth_date),
          stud_gender: parseGenderValue(record?.['Student Gender'] ?? record?.stud_gender),
          stud_father_name: record?.['Student Father Name'] ?? record?.stud_father_name ?? '',
          stud_mother_name: record?.['Student Mother Name'] ?? record?.stud_mother_name ?? ''
        });
      } catch (err) {
        if (isActive) setSubmitStatus({ type: 'error', message: 'Unable to load details.' });
      } finally {
        if (isActive) setIsFetchingRecord(false);
      }
    };
    loadStudent();
    return () => { isActive = false; };
  }, [activeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = new URLSearchParams();
    payload.append('stud_name', formData.stud_name.trim());
    payload.append('stud_birth_date', formData.stud_birth_date);
    payload.append('stud_gender', String(formData.stud_gender));
    payload.append('stud_father_name', formData.stud_father_name.trim());
    payload.append('stud_mother_name', formData.stud_mother_name.trim());
    payload.append('stud_user_id', userid);

    if (isEditMode) {
      payload.append('stud_id', activeId);
    }

    try {
      const apiUrl = isEditMode
        ? 'api/student_personal_information_insert/student_personal_information_update'
        : 'api/student_personal_information_insert/student_personal_information_insert';

      const response = await api.post(apiUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      Swal.fire({ icon: 'success', title: isEditMode ? 'Updated' : 'Saved', text: 'Information processed successfully!' });
      if (!isEditMode) resetForm(true);
      navigate(`/list_student_personal_information`, { state: { hasLoaded: true } });
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
            {isViewMode ? 'View Student Details' : isEditMode ? 'Edit Student Profile' : 'Student Information'}
          </h2>
          <p>
            {isViewMode ? 'Viewing recorded information' : 'Complete the profile details accurately.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-group">
            <label>Student Name <span className="required">*</span></label>
            <input
              type="text"
              name="stud_name"
              value={formData.stud_name}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`form-input ${errors.stud_name ? 'input-error' : ''}`}
              disabled={isFieldDisabled}
            />
            {errors.stud_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.stud_name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Birth Date <span className="required">*</span></label>
              <input
                type="date"
                name="stud_birth_date"
                value={formData.stud_birth_date}
                onChange={handleChange}
                className={`form-input ${errors.stud_birth_date ? 'input-error' : ''}`}
                disabled={isFieldDisabled}
              />
              {errors.stud_birth_date && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.stud_birth_date}</span>}
            </div>

            <div className="form-group">
              <label>Gender <span className="required">*</span></label>
              <div className="radio-group">
                <label className="radio-option">
                  <input type="radio" name="stud_gender" value="1" checked={formData.stud_gender === 1} onChange={handleGenderChange} disabled={isFieldDisabled} />
                  <span className="radio-custom-btn">Male</span>
                </label>
                <label className="radio-option">
                  <input type="radio" name="stud_gender" value="2" checked={formData.stud_gender === 2} onChange={handleGenderChange} disabled={isFieldDisabled} />
                  <span className="radio-custom-btn">Female</span>
                </label>
              </div>
              {errors.stud_gender && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.stud_gender}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Father's Name <span className="required">*</span></label>
            <input type="text" name="stud_father_name" value={formData.stud_father_name} onChange={handleChange} placeholder="Enter father's name" className={`form-input ${errors.stud_father_name ? 'input-error' : ''}`} disabled={isFieldDisabled} />
            {errors.stud_father_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.stud_father_name}</span>}
          </div>

          <div className="form-group">
            <label>Mother's Name <span className="required">*</span></label>
            <input type="text" name="stud_mother_name" value={formData.stud_mother_name} onChange={handleChange} placeholder="Enter mother's name" className={`form-input ${errors.stud_mother_name ? 'input-error' : ''}`} disabled={isFieldDisabled} />
            {errors.stud_mother_name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.stud_mother_name}</span>}
          </div>

          {submitStatus.message && (
            <div className={`status-message ${submitStatus.type}`}>{submitStatus.message}</div>
          )}

          <div className="form-buttons">
            {!isViewMode && (
              <button type="submit" className="btn btn-submit" disabled={isFieldDisabled}>
                {isSubmitting ? <span className="spinner"></span> : (isEditMode ? 'Update Information' : 'Save Information')}
              </button>
            )}

            <button type="button" className="btn btn-reset" disabled={isSubmitting} onClick={() => navigate('/list_student_personal_information', { state: { hasLoaded: true } })}>
              {isViewMode ? 'Back to List' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Student_personal_information;