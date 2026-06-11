import React, { useEffect, useState } from 'react';
import api from '../back_end_url/api_url';
import '../css/From_Master_page.css';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Searchtrums from '../Type&search/Searchtrums';

const toInputDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : '';
};

function AddStudentForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editingId = searchParams.get('id');
    const viewingId = searchParams.get('viewid');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id;
    const activeId = editingId || viewingId;

    const [formData, setFormData] = useState({
        firstName: '',
        category: '',
        lastName: '',
        gender: '',
        dob: '',
        age: '',
        bloodGroup: '',
        aadharCardNumber: '',
        mobile: '',
        altMobile: '',
        email: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        stateName: '',
        country: '',
        countryName: '',
        pincode: '',
        fatherName: '',
        motherName: '',
        guardianName: '',
        parentContact: '',
        parentEmail: '',
        studentCode: '',
        rollNo: '',
        admissionNo: '',
        enrollmentNumber: '',
        admissionyear: '',
        semesterYear: '',
        department: '',
        courseProgram: '',
        admissionType: '',
        division: '',
        college: ''
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for Image Popup
    const [storedProfilePhoto, setStoredProfilePhoto] = useState('');
    const [originalProfilePhoto, setOriginalProfilePhoto] = useState('');

    const handlePhotoChange = (e) => {

        const file = e.target.files[0];

        if (file) {

            setProfilePhoto(file);

            // original name
            setOriginalProfilePhoto(file.name);

            // preview
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingRecord, setIsFetchingRecord] = useState(false);
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);

    const isEditMode = Boolean(editingId);
    const isViewMode = Boolean(viewingId);
    const isFieldDisabled = isSubmitting || isFetchingRecord || isViewMode;

    const handleChange = (e) => {
        const { name, value, item } = e.target;

        let finalValue = value;

        if (name === 'mobile' || name === 'parentContact') {
            finalValue = value.replace(/\D/g, '');
            if (finalValue.length > 10) return;
        } else if (name === 'aadharCardNumber') {
            finalValue = value.replace(/\D/g, '');
            if (finalValue.length > 12) return;
        } else if (name === 'pincode') {
            finalValue = value.replace(/\D/g, '');
            if (finalValue.length > 6) return;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: finalValue };
            if (name === 'dob') {
                updated.age = calculateAge(finalValue);
            }
            if (name === 'city') {
                if (item) {
                    updated.state = item.cim_state_id || '';
                    updated.stateName = item.sm_state_name || '';
                    updated.country = item.cim_country_id || '';
                    updated.countryName = item.cm_country_name || '';
                } else if (!finalValue) {
                    updated.state = '';
                    updated.stateName = '';
                    updated.country = '';
                    updated.countryName = '';
                }
            }
            return updated;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^\d{10}$/;
        const aadharRegex = /^\d{12}$/;

        if (step === 1) {
            if (!photoPreview) {
                newErrors.photo = 'Profile Photo is required';
            }
            if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.dob) newErrors.dob = 'Date of Birth is required';
            if (!formData.fatherName?.trim()) newErrors.fatherName = 'Father Name is required';
            if (!formData.motherName?.trim()) newErrors.motherName = 'Mother Name is required';

            if (!formData.mobile?.trim()) {
                newErrors.mobile = 'Mobile Number is required';
            } else if (!mobileRegex.test(formData.mobile.trim())) {
                newErrors.mobile = 'Enter a valid 10-digit mobile number';
            }

            if (!formData.email?.trim()) {
                newErrors.email = 'Email is required';
            } else if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = 'Enter a valid email address';
            }

            if (!formData.category) newErrors.category = 'Category is required';

            if (formData.aadharCardNumber?.trim() && !aadharRegex.test(formData.aadharCardNumber.trim())) {
                newErrors.aadharCardNumber = 'Enter a valid 12-digit Aadhar card number';
            }
        } else if (step === 2) {
            if (!formData.studentCode?.trim()) newErrors.studentCode = 'Student Code is required';
            if (!formData.rollNo?.trim()) newErrors.rollNo = 'Roll No is required';
            if (!formData.admissionNo?.trim()) newErrors.admissionNo = 'Admission No is required';
            if (!formData.enrollmentNumber?.trim()) newErrors.enrollmentNumber = 'Enrollment Number is required';
            if (!formData.admissionyear?.trim()) newErrors.admissionyear = 'Admission year is required';
            if (!formData.semesterYear?.trim()) newErrors.semesterYear = 'Semester is required';
            if (!formData.department?.trim()) newErrors.department = 'Department is required';
            if (!formData.courseProgram?.trim()) newErrors.courseProgram = 'Course / Program is required';
            if (!formData.admissionType?.trim()) newErrors.admissionType = 'Admission Type is required';
            if (!formData.college?.trim()) newErrors.college = 'College is required';
            if (!formData.division?.trim()) newErrors.division = 'Division is required';
        } else if (step === 3) {
            if (!formData.address1?.trim()) newErrors.address1 = 'Address Line 1 is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.country) newErrors.country = 'Country is required';

            if (!formData.parentContact?.trim()) {
                newErrors.parentContact = 'Father Mobile No is required';
            } else if (!mobileRegex.test(formData.parentContact.trim())) {
                newErrors.parentContact = 'Enter a valid 10-digit mobile number';
            }

            if (formData.parentEmail?.trim() && !emailRegex.test(formData.parentEmail.trim())) {
                newErrors.parentEmail = 'Enter a valid email address';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (isViewMode) {
            setCurrentStep(prev => prev + 1);
            return;
        }
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleStepClick = (stepNum) => {
        setCurrentStep(stepNum);
    };

    const validateForm = () => {
        if (!validateStep(1)) { setCurrentStep(1); showError(); return false; }
        if (!validateStep(2)) { setCurrentStep(2); showError(); return false; }
        if (!validateStep(3)) { setCurrentStep(3); showError(); return false; }
        return true;
    };

    useEffect(() => {
        if (!activeId) return;
        const loadStudent = async () => {
            setIsFetchingRecord(true);
            try {
                const response = await api.get('/api/new_student_details_contoller/new_student_details_select_by_id', {
                    params: { id: activeId, user_id: userid }
                });
                const record = response.data?.Result?.[0];

                if (record) {
                    let formattedDob = '';
                    if (record.date_of_birth) {
                        const parts = record.date_of_birth.split('/');
                        if (parts.length === 3) {
                            // Convert DD/MM/YYYY to YYYY-MM-DD
                            formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        } else {
                            formattedDob = toInputDate(record.date_of_birth);
                        }
                    }

                    setFormData(prev => ({
                        ...prev,
                        firstName: record.first_name || '',
                        category: record.nsd_category || '',
                        lastName: record.nsd_last_name || '',
                        gender: record.gender || '',
                        dob: formattedDob,
                        age: record.nsd_age || '',
                        mobile: record.nsd_mobile_number || '',
                        email: record.nsd_email || '',
                        address1: record.nsd_address || '',
                        city: record.nsd_city_id || '',
                        cityName: record.cim_city_name || '',
                        state: record.nsd_state_id || '',
                        stateName: record.sm_state_name || '',
                        country: record.nsd_country_id || '',
                        countryName: record.cm_country_name || '',
                        pincode: record.nsd_pincode || '',
                        fatherName: record.nsd_father_name || '',
                        motherName: record.nsd_mother_name || '',
                        parentContact: record.nsd_parent_contact_number || '',
                        parentEmail: record.nsd_parent_email || '',
                        studentCode: record.nsd_student_code || '',
                        rollNo: record.nsd_roll_no || '',
                        admissionNo: record.nsd_admission_no || '',
                        enrollmentNumber: record.nsd_enrollment_number || '',
                        bloodGroup: record.nsd_blood_group || '',
                        aadharCardNumber: record.nsd_aadhar_card_number || '',


                    }));

                    if (record.nsd_profile_photo) {

                        let baseUrl = api.defaults.baseURL || '';

                        if (baseUrl && !baseUrl.endsWith('/')) {
                            baseUrl += '/';
                        }

                        const imageUrl =
                            `${baseUrl}Upload_Photo/student_Profile_Photo/${record.nsd_profile_photo}`;

                        setPhotoPreview(imageUrl);

                        // encrypted file name
                        setStoredProfilePhoto(record.nsd_profile_photo || '');

                        // IMPORTANT FIX
                        // if DB original name null then use encrypted name
                        setOriginalProfilePhoto(record.nsd_original_profile_photo || '');
                    }
                }
            } catch (err) {
                Swal.fire('Error', 'Unable to load student details', 'error');
            } finally {
                setIsFetchingRecord(false);
            }
        };
        loadStudent();
    }, [activeId, userid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload = new FormData();

        // Map form fields to API parameter names
        payload.append('create_By', userid || 0);
        payload.append('first_name', formData.firstName || '');
        payload.append('nsd_category', formData.category || '');
        payload.append('nsd_last_name', formData.lastName || '');
        payload.append('nsd_gender', formData.gender === 'Male' ? 1 : formData.gender === 'Female' ? 2 : formData.gender === 'Other' ? 3 : 0);
        payload.append('nsd_date_of_birth', formData.dob ? new Date(formData.dob).toISOString() : '');
        payload.append('nsd_age', Number(formData.age) || 0);
        payload.append('nsd_blood_group', formData.bloodGroup || '');
        payload.append('nsd_aadhar_card_number', formData.aadharCardNumber || '');

        payload.append('nsd_student_code', formData.studentCode || '');
        payload.append('nsd_roll_no', formData.rollNo || '');
        payload.append('nsd_admission_no', formData.admissionNo || '');
        payload.append('nsd_enrollment_number', formData.enrollmentNumber || '');
        payload.append('nsd_enrollment_year', formData.admissionyear || '');
        payload.append('nsd_semester_year', formData.semesterYear || '');
        payload.append('nsd_department', formData.department || '');
        payload.append('nsd_course_program', formData.courseProgram || '');
        payload.append('nsd_admission_type', formData.admissionType || '');
        payload.append('nsd_division', formData.division || '');
        payload.append('nsd_college', formData.college || '');

        // Extract existing filename from preview URL if any
        // original file name
        payload.append(
            'nsd_original_profile_photo',
            profilePhoto
                ? profilePhoto.name
                : originalProfilePhoto
        );

        // encrypted/stored file name
        payload.append(
            'nsd_profile_photo',
            storedProfilePhoto
        );


        if (profilePhoto) {
            payload.append('ProfilePhotoFile', profilePhoto);
        } else {
            // Append a 0-byte dummy file to satisfy ASP.NET Core [Required] attribute for IFormFile
            // without providing actual data. Backends usually check if (file.Length > 0) before saving.
            const emptyFile = new File([], "empty.png", { type: "image/png" });
            payload.append('ProfilePhotoFile', emptyFile);
        }
        payload.append('nsd_mobile_number', formData.mobile || '');
        payload.append('nsd_email', formData.email || '');
        payload.append('nsd_address', formData.address1 || '');
        payload.append('nsd_address2', formData.address2 || '');
        payload.append('nsd_state_id', Number(formData.state) || 0);
        payload.append('nsd_country_id', Number(formData.country) || 0);
        payload.append('nsd_father_name', formData.fatherName || '');
        payload.append('nsd_mother_name', formData.motherName || '');
        payload.append('nsd_parent_contact_number', formData.parentContact || '');
        payload.append('nsd_parent_email', formData.parentEmail || '');
        payload.append('nsd_city_id', Number(formData.city) || 0);
        payload.append('nsd_pincode', formData.pincode || '');

        if (isEditMode) {
            payload.append('nsd_id', activeId);
        }
        const endpoint = isEditMode
            ? '/api/new_student_details_contoller/new_student_details_update'
            : '/api/new_student_details_contoller/new_student_details_insert';

        try {
            await api.post(endpoint, payload);
            Swal.fire({ icon: 'success', title: isEditMode ? 'Updated' : 'Saved', text: 'Student recorded successfully!' });
            navigate('/List_Add_Student_Form', { state: { hasLoaded: true } });
        } catch (error) {
            console.error('API Error Response:', error.response?.data);

            let errorMsg = 'An error occurred while saving.';
            if (error.response?.data?.errors) {
                // ASP.NET Core Validation Errors
                const validationErrors = Object.values(error.response.data.errors).flat();
                errorMsg = validationErrors.join('<br/>');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (typeof error.response?.data === 'string') {
                errorMsg = error.response.data;
            }
            Swal.fire({
                icon: 'error',
                title: 'Validation Error (400)',
                html: errorMsg
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="student-form-container" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* Left Sidebar */}
            <div className="left-panel" style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: "25px" }}>
                <div className="form-card" style={{ padding: '30px 20px', textAlign: 'center' }}>
                    <div className="photo-upload-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', position: 'relative' }}>
                        <div
                            className={`photo-preview ${photoPreview ? 'clickable' : ''}`}
                            onClick={() => photoPreview && setIsModalOpen(true)}
                            style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: `2px dashed ${errors.photo ? 'red' : '#ccc'}`, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span className="photo-placeholder" style={{ fontSize: '40px', color: '#aaa' }}>👤</span>
                            )}
                        </div>
                        <div className="upload-btn-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', cursor: "pointer" }}>
                            <button type="button" className="btn btn-submit" style={{ padding: '5px 15px', fontSize: '12px', margin: 0, cursor: "pointer" }}>Choose File</button>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isFieldDisabled} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                        </div>
                        {errors.photo && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.photo}</span>}
                    </div>
                    <h4 style={{ marginTop: '15px', color: '#333', fontSize: '16px' }}>
                        {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Student Name'}
                    </h4>
                </div>

                <div className="form-card" style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h5 style={{ marginBottom: '15px', fontSize: '14px', color: '#555' }}>Vaccination Certificate</h5>
                    <div className="photo-upload-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '80px', height: '100px', border: '2px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                            <span style={{ fontSize: '30px', color: '#aaa' }}>📄</span>
                        </div>
                        <div className="upload-btn-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', cursor: "pointer" }}>
                            <button type="button" className="btn btn-submit" style={{ padding: '5px 15px', fontSize: '12px', margin: 0, cursor: "pointer" }}>Choose File</button>
                            <input type="file" accept="application/pdf,image/*" disabled={isFieldDisabled} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Main Form */}
            <div className="right-panel" style={{ flex: '1', minWidth: 0, padding: "0px 50px" }}>
                <div className="form-card">
                    <div className="form-header" >
                        <h2>{isViewMode ? 'View Student' : isEditMode ? 'Edit Student' : 'Add New Student'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="student-form">
                        {/* Step Progress Indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative', padding: '0 20px' }}>
                            {/* Progress Line */}
                            <div style={{ position: 'absolute', top: '20px', left: '40px', right: '40px', height: '4px', backgroundColor: '#e0e0e0', zIndex: '0', transform: 'translateY(-50%)' }}></div>
                            <div style={{ position: 'absolute', top: '20px', left: '40px', width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 80px)', height: '4px', backgroundColor: '#4a90e2', zIndex: '1', transform: 'translateY(-50%)', transition: 'width 0.3s ease' }}></div>

                            {/* Steps */}
                            {['Personal Details', 'Academic Details', 'Contact Details'].map((stepName, index) => {
                                const stepNum = index + 1;
                                const isActive = currentStep === stepNum;
                                const isCompleted = currentStep > stepNum;
                                return (
                                    <div key={stepNum} onClick={() => handleStepClick(stepNum)} style={{ position: 'relative', zIndex: '2', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', cursor: 'pointer' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            backgroundColor: isActive || isCompleted ? '#4a90e2' : '#f0f0f0',
                                            color: isActive || isCompleted ? 'white' : '#666',
                                            fontWeight: 'bold', border: `3px solid ${isActive || isCompleted ? '#4a90e2' : '#e0e0e0'}`,
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {isCompleted ? '✓' : stepNum}
                                        </div>
                                        <span style={{ marginTop: '8px', fontSize: '13px', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#333' : '#777', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            {stepName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 1. Personal Details */}
                        {currentStep === 1 && (
                            <fieldset className="form-fieldset">
                                <legend><i className="fa fa-user-circle"></i> Personal Details</legend>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name <span className="required">*</span></label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={`form-input ${errors.firstName ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter first name" />
                                        {errors.firstName && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.firstName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name <span className="required">*</span></label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={`form-input ${errors.lastName ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter last name" />
                                        {errors.lastName && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.lastName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">

                                    <div className="form-group">
                                        <label>Father Name <span className="required">*</span></label>
                                        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={`form-input ${errors.fatherName ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter father's name" />
                                        {errors.fatherName && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.fatherName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Mother Name <span className="required">*</span></label>
                                        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className={`form-input ${errors.motherName ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter mother's name" />
                                        {errors.motherName && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.motherName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Mobile Number <span className="required">*</span></label>
                                        <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className={`form-input ${errors.mobile ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter mobile number" />
                                        {errors.mobile && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.mobile}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Gender <span className="required">*</span></label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={`form-input ${errors.gender ? 'input-error' : ''}`} disabled={isFieldDisabled}>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.gender && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.gender}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth <span className="required">*</span></label>
                                        <input type="date" name="dob" min="1900-01-01" max="9999-12-31" value={formData.dob} onChange={handleChange} className={`form-input ${errors.dob ? 'input-error' : ''}`} disabled={isFieldDisabled} />
                                        {errors.dob && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.dob}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input type="text" name="age" value={formData.age} className="form-input" disabled={true} placeholder="Age will auto-calculate" />
                                    </div>

                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email <span className="required">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter email address" />
                                        {errors.email && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Category <span className="required">*</span></label>
                                        <select name="category" value={formData.category} onChange={handleChange} className={`form-input ${errors.category ? 'input-error' : ''}`} disabled={isFieldDisabled}>
                                            <option value="">Select</option>
                                            <option value="General">General</option>
                                            <option value="OBC">OBC</option>
                                            <option value="SC">SC</option>
                                            <option value="ST">ST</option>
                                        </select>
                                        {errors.category && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Blood Group</label>
                                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-input" disabled={isFieldDisabled}>
                                            <option value="">Select</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Aadhar Card Number</label>
                                        <input type="text" name="aadharCardNumber" value={formData.aadharCardNumber} onChange={handleChange} className={`form-input ${errors.aadharCardNumber ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter Aadhar card number" />
                                        {errors.aadharCardNumber && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.aadharCardNumber}</span>}
                                    </div>
                                </div>
                            </fieldset>
                        )}

                        {/* 2. Academic Details */}
                        {currentStep === 2 && (
                            <fieldset className="form-fieldset">
                                <legend><i className="fa fa-graduation-cap"></i> Academic Details</legend>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Admission year <span className="required">*</span></label>
                                        <input type="text" name="admissionyear" value={formData.admissionyear} onChange={handleChange} className={`form-input ${errors.admissionyear ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter Admission year" />
                                        {errors.admissionyear && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.admissionyear}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Semester<span className="required">*</span></label>
                                        <input type="text" name="semesterYear" value={formData.semesterYear} onChange={handleChange} className={`form-input ${errors.semesterYear ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter semester / year" />
                                        {errors.semesterYear && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.semesterYear}</span>}
                                    </div>

                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Department <span className="required">*</span></label>
                                        <input type="text" name="department" value={formData.department} onChange={handleChange} className={`form-input ${errors.department ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter department" />
                                        {errors.department && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.department}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Course / Program <span className="required">*</span></label>
                                        <input type="text" name="courseProgram" value={formData.courseProgram} onChange={handleChange} className={`form-input ${errors.courseProgram ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter course / program" />
                                        {errors.courseProgram && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.courseProgram}</span>}
                                    </div>

                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Admission Type <span className="required">*</span></label>
                                        <input type="text" name="admissionType" value={formData.admissionType} onChange={handleChange} className={`form-input ${errors.admissionType ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter admission type" />
                                        {errors.admissionType && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.admissionType}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>College <span className="required">*</span></label>
                                        <input type="text" name="college" value={formData.college} onChange={handleChange} className={`form-input ${errors.college ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter college" />
                                        {errors.college && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.college}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Division <span className="required">*</span></label>
                                        <input type="text" name="division" value={formData.division} onChange={handleChange} className={`form-input ${errors.division ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter division" />
                                        {errors.division && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.division}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Enrollment Number <span className="required">*</span></label>
                                        <input type="text" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} className={`form-input ${errors.enrollmentNumber ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter enrollment number" />
                                        {errors.enrollmentNumber && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.enrollmentNumber}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Roll No <span className="required">*</span></label>
                                        <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} className={`form-input ${errors.rollNo ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter roll no" />
                                        {errors.rollNo && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.rollNo}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Admission No <span className="required">*</span></label>
                                        <input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleChange} className={`form-input ${errors.admissionNo ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter admission no" />
                                        {errors.admissionNo && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.admissionNo}</span>}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Student Code <span className="required">*</span></label>
                                        <input type="text" name="studentCode" value={formData.studentCode} onChange={handleChange} className={`form-input ${errors.studentCode ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter student code" />
                                        {errors.studentCode && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.studentCode}</span>}
                                    </div>
                                </div>
                            </fieldset>
                        )}

                        {/* 3. Contact Details */}
                        {currentStep === 3 && (
                            <fieldset className="form-fieldset">
                                <legend><i className="fa fa-address-book"></i> Contact Details</legend>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Address Line 1 <span className="required">*</span></label>
                                        <textarea name="address1" value={formData.address1} onChange={handleChange} className={`form-input form-textarea ${errors.address1 ? 'input-error' : ''}`} disabled={isFieldDisabled} rows="2" placeholder="Enter address line 1" />
                                        {errors.address1 && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.address1}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Address Line 2</label>
                                        <textarea name="address2" value={formData.address2} onChange={handleChange} className="form-input form-textarea" disabled={isFieldDisabled} rows="2" placeholder="Enter address line 2" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Father Mobile No. <span className="required">*</span></label>
                                        <input type="text" name="parentContact" value={formData.parentContact} onChange={handleChange} className={`form-input ${errors.parentContact ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter father's mobile no." />
                                        {errors.parentContact && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.parentContact}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>City <span className="required">*</span></label>
                                        <Searchtrums
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            disabled={isFieldDisabled}
                                            placeholder="select your city"
                                            apiUrl={`api/new_student_details_contoller/city_master_search`}
                                            idField="cim_id"
                                            nameField="cim_city_name"
                                            searchParamName="searchtrums"
                                        />
                                        {errors.city && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.city}</span>}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>State <span className="required">*</span></label>
                                        <Searchtrums
                                            name="state"
                                            value={formData.state}
                                            displayValue={formData.stateName}
                                            onChange={handleChange}
                                            disabled={true}
                                            placeholder="select your state"
                                            apiUrl={`api/new_student_details_contoller/city_master_search_State?city_id=${formData.city}`}
                                            idField="cim_id"
                                            nameField="sm_state_name"
                                            searchParamName="searchtrums"
                                        />
                                        {errors.state && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.state}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Country <span className="required">*</span></label>
                                        <Searchtrums
                                            name="country"
                                            value={formData.country}
                                            displayValue={formData.countryName}
                                            onChange={handleChange}
                                            disabled={true}
                                            placeholder="select your country"
                                            apiUrl={`api/new_student_details_contoller/city_master_search_country?city_id=${formData.city}`}
                                            idField="cim_id"
                                            nameField="cm_country_name"
                                            searchParamName="searchtrums"
                                        />
                                        {errors.country && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.country}</span>}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Pin Code</label>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="form-input" disabled={isFieldDisabled} placeholder="Enter pin code" />
                                    </div>
                                    <div className="form-group">
                                        <label>Parent Email</label>
                                        <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} className={`form-input ${errors.parentEmail ? 'input-error' : ''}`} disabled={isFieldDisabled} placeholder="Enter parent's email address" />
                                        {errors.parentEmail && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.parentEmail}</span>}
                                    </div>
                                </div>
                            </fieldset>
                        )}

                        <div className="form-buttons" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <div>
                                {currentStep > 1 && (
                                    <button type="button" className="btn btn-reset" onClick={prevStep} disabled={isSubmitting} style={{ marginRight: '10px' }}>
                                        <i className="fa fa-arrow-left" style={{ marginRight: '5px' }}></i> Previous
                                    </button>
                                )}
                            </div>
                            <div>
                                <button type="button" className="btn btn-reset" onClick={() => navigate('/List_Add_Student_Form', { state: { hasLoaded: true } })} style={{ marginRight: '10px' }}>
                                    {isViewMode ? 'Back' : 'Cancel'}
                                </button>
                                {currentStep < 3 && (
                                    <button type="button" className="btn btn-submit" onClick={nextStep} disabled={isSubmitting} style={{ marginRight: '10px' }}>
                                        Next <i className="fa fa-arrow-right" style={{ marginLeft: '5px' }}></i>
                                    </button>
                                )}
                                {currentStep === 3 && !isViewMode && (
                                    <button type="submit" className="btn btn-submit" disabled={isFieldDisabled}>
                                        <i className="fa fa-save" style={{ marginRight: '5px' }}></i> {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Save Student')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* IMAGE POPUP MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        <img src={photoPreview} alt="Full View" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddStudentForm;