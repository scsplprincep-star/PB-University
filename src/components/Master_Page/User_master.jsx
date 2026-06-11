import React, { useState, useEffect } from 'react';
import api from '../back_end_url/api_url';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
// Using the same CSS file as your Menu Master for consistent design
import '../css/From_Master_page.css';

function User_master() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const viewid = searchParams.get('viewid');
  const isView = !!viewid;
  const currentId = id || viewid;

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userid = searchParams.get('userId') || storedUser.um_id || 0;

  // State to manage form data
  const [formData, setFormData] = useState({
    userName: '',
    emailId: '',
    password: '',
    userRole: ''
  });

  // State to manage validation errors
  const [errors, setErrors] = useState({});

  // State to manage loading
  const [isLoading, setIsLoading] = useState(false);

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'User Name is required';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'User Name must be at least 3 characters';
    }

    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = 'Email ID is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Role mapping logic
  const getLoginIdFromRole = (role) => {
    const roleMapping = {
      'selectuserRole': 0,
      'admin': 1,
      'student': 2,
      'teacher': 3,
      'principal': 4,
      'staff': 5
    };
    return roleMapping[role] || 0;
  };

  const getRoleFromLoginId = (loginId) => {
    const roleMapping = {
      0: 'selectuserRole',
      1: 'admin',
      2: 'student',
      3: 'teacher',
      4: 'principal',
      5: 'staff'
    };
    return roleMapping[loginId] || '';
  };

  // Fetch user data for Edit/View
  useEffect(() => {
    if (currentId) {
      fetchUserData(currentId);
    }
  }, [currentId]);

  const fetchUserData = async (currentId) => {
    setIsLoading(true);
    try {
      const response = await api.get('api/user_master_pagecs_/user_master_select_by_id', {
        params: { id: currentId }
      });

      let result = response.data;
      if (typeof result === 'string') result = JSON.parse(result);

      if (result?.Status === 1 && result?.Result?.length > 0) {
        const userData = result.Result[0];
        setFormData({
          userName: userData.user_name || '',
          emailId: userData.user_id || '',
          password: userData.Password,
          userRole: getRoleFromLoginId(userData.Login_id)
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch user data.' });
      }
    } catch (error) {
      console.error("API Error", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred while fetching user data.' });
    } finally {
      setIsLoading(false);
    }
  };


  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const apiData = new URLSearchParams();
        apiData.append('create_By', userid);
        apiData.append('um_user_name', formData.userName);
        apiData.append('um_email_id', formData.emailId);
        apiData.append('um_password', formData.password);
        apiData.append('login_id', getLoginIdFromRole(formData.userRole));

        let apiUrl = 'api/user_master_pagecs_/user_master_insert_user';
        if (id) {
          apiUrl = 'api/user_master_pagecs_/user_master_update';
          apiData.append('um_id', currentId);
          apiData.append('modifiy_By', userid); // or 0 as per swagger
        }

        const response = await api.post(apiUrl, apiData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        let result = response.data;
        if (typeof result === 'string') result = JSON.parse(result);

        const statusFromApi = result?.Status ?? result?.status;
        const messageFromApi = result?.Message ?? result?.message ?? 'User registration completed.';

        if (statusFromApi === 1) {
          Swal.fire({
            icon: 'success',
            title: 'Data Saved Successfully',
            text: messageFromApi,
          });
          navigate(`/List_User_master`, { state: { hasLoaded: true } });
        } else {
          Swal.fire({ icon: 'info', title: 'Registration Failed', text: messageFromApi });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while connecting to the server.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };



  return (
    <div className="student-form-container">
      <div className="form-card">
        {/* Header section matching Menu Master */}
        <div className="form-header">
          <h2>{isView ? 'View User' : id ? 'Edit User' : 'User Registration'}</h2>
          <p>{isView ? 'View user credentials here.' : 'Create and manage system user credentials here.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="student-form">

          {/* User Name Field */}
          <div className="form-group">
            <label>User Name <span className="required">*</span></label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter User Name"
              className={`form-input ${errors.userName ? 'input-error' : ''}`}
              disabled={isLoading || isView}
            />
            {errors.userName && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.userName}</span>}
          </div>

          {/* Email ID Field */}
          <div className="form-group">
            <label>Email ID <span className="required">*</span></label>
            <input
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              placeholder="e.g. user@example.com"
              className={`form-input ${errors.emailId ? 'input-error' : ''}`}
              disabled={isLoading || isView}
            />
            {errors.emailId && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.emailId}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter secure password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                disabled={isLoading || isView}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.password}</span>}
          </div>

          {/* User Role Dropdown */}
          <div className="form-group">
            <label>User Role <span className="required"></span></label>
            <select
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
              className={`form-input ${errors.userRole ? 'input-error' : ''}`}
              disabled={isLoading || isView}
              style={{ cursor: 'pointer' }}
            >
              <option value="selectuserRole">Select User Role</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Action Buttons matching Menu Master */}
          <div className="form-buttons">
            {!isView && (
              <button type="submit" className="btn btn-submit" disabled={isLoading}>
                {isLoading ? <span className="spinner"></span> : id ? 'Update Registration' : 'Submit Registration'}
              </button>
            )}

            <button
              type="button"
              className="btn btn-reset"
              disabled={isLoading}
              onClick={() => navigate('/List_User_master', { state: { hasLoaded: true } })}
            >
              {isView ? 'Back' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default User_master;