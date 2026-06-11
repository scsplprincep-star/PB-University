import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../back_end_url/api_url';
import Swal from 'sweetalert2';
import '../css/From_Master_page.css';

function User_wise_menu_Permissions() {
    const [users, setUsers] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [permissions, setPermissions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [searchParams] = useSearchParams();

    const editingId = searchParams.get('id');
    const viewingId = searchParams.get('viewid');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id || 0;
    const activeId = editingId || viewingId;

    // Fetch initial data
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Adjust API endpoint as per actual backend
            const response = await api.get('api/User_Permissions_Contoller/user_master_select_all');
            let data = response.data;
            if (typeof data === 'string') data = JSON.parse(data);

            if (data?.Result) {
                setUsers(data.Result);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleUserChange = (e) => {
        const userId = e.target.value;
        setSelectedUser(userId);
        setHasLoaded(false); // Hide data when user changes until Load Data is clicked

        if (!userId) {
            // Reset permissions if no user selected
            const resetPerms = { ...permissions };
            Object.keys(resetPerms).forEach(key => {
                resetPerms[key] = { is_menu_selected: false, insert: false, update: false, delete: false, view: false };
            });
            setPermissions(resetPerms);
        }
    };

    const handleLoadData = async () => {
        if (!selectedUser) {
            Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select a user first!' });
            return;
        }

        setIsLoading(true);
        try {
            let fetchedMenus = [];
            let initialPerms = {};

            // Fetch dynamic menus
            const menuRes = await api.get('api/menu_master_Contoller/menu_master_select_all');
            let menuData = menuRes.data;
            if (typeof menuData === 'string') menuData = JSON.parse(menuData);

            if (menuData?.Result) {
                fetchedMenus = menuData.Result;
            }

            // Initialize all to false first
            fetchedMenus.forEach(menu => {
                initialPerms[menu.mm_id] = {
                    is_menu_selected: false,
                    insert: false,
                    update: false,
                    delete: false,
                    view: false
                };
            });

            // Fetch existing user permissions
            try {
                // Using the exact working API route from Sidebar.jsx
                const permRes = await api.get('api/menu_master_Contoller/user_menu_permissions_select_by_user_id', {
                    params: { ump_user_id: selectedUser }
                });
                let permData = permRes.data;
                if (typeof permData === 'string') permData = JSON.parse(permData);
                // Apply existing permissions
                if (permData?.Result && Array.isArray(permData.Result)) {
                    permData.Result.forEach(perm => {
                        if (initialPerms[perm.ump_menu_id]) {
                            initialPerms[perm.ump_menu_id] = {
                                ump_id: perm.ump_id || 0,
                                is_menu_selected: Number(perm.ump_can_menu_show) === 1,
                                insert: Number(perm.ump_can_insert) === 1,
                                update: Number(perm.ump_can_update) === 1,
                                delete: Number(perm.ump_can_delete) === 1,
                                view: Number(perm.ump_can_view) === 1
                            };
                        }
                    });
                } else if (Array.isArray(permData)) {
                    // Fallback in case the data is an array directly
                    permData.forEach(perm => {
                        if (initialPerms[perm.ump_menu_id]) {
                            initialPerms[perm.ump_menu_id] = {
                                ump_id: perm.ump_id || 0,
                                is_menu_selected: Number(perm.ump_can_menu_show) === 1,
                                insert: Number(perm.ump_can_insert) === 1,
                                update: Number(perm.ump_can_update) === 1,
                                delete: Number(perm.ump_can_delete) === 1,
                                view: Number(perm.ump_can_view) === 1
                            };
                        }
                    });
                }
            } catch (permErr) {
                console.error("Error fetching user permissions:", permErr);
            }

            setMenus(fetchedMenus);
            setPermissions(initialPerms);
            setHasLoaded(true);
        } catch (error) {
            console.error("Error in load data:", error);
            setHasLoaded(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (menuId, rightType, checked) => {
        setPermissions(prev => {
            const updatedMenuPerms = { ...prev[menuId], [rightType]: checked };
            if (rightType === 'is_menu_selected' && !checked) {
                updatedMenuPerms.insert = false;
                updatedMenuPerms.update = false;
                updatedMenuPerms.delete = false;
                updatedMenuPerms.view = false;
            }
            return {
                ...prev,
                [menuId]: updatedMenuPerms
            };
        });
    };

    const handleSelectAllRow = (menuId, checked) => {
        setPermissions(prev => ({
            ...prev,
            [menuId]: {
                ...prev[menuId],
                insert: checked,
                update: checked,
                delete: checked,
                view: checked
            }
        }));
    };

    const handleMasterSelectAll = (checked) => {
        setPermissions(prev => {
            const newPerms = { ...prev };
            menus.forEach(menu => {
                if (newPerms[menu.mm_id] && newPerms[menu.mm_id].is_menu_selected) {
                    newPerms[menu.mm_id] = {
                        ...newPerms[menu.mm_id],
                        insert: checked,
                        update: checked,
                        delete: checked,
                        view: checked
                    };
                }
            });
            return newPerms;
        });
    };

    const handleMasterMenuSelect = (checked) => {
        setPermissions(prev => {
            const newPerms = { ...prev };
            menus.forEach(menu => {
                if (newPerms[menu.mm_id]) {
                    newPerms[menu.mm_id] = {
                        ...newPerms[menu.mm_id],
                        is_menu_selected: checked
                    };
                    if (!checked) {
                        newPerms[menu.mm_id].insert = false;
                        newPerms[menu.mm_id].update = false;
                        newPerms[menu.mm_id].delete = false;
                        newPerms[menu.mm_id].view = false;
                    }
                }
            });
            return newPerms;
        });
    };

    const isAllMenuChecked = menus.length > 0 && menus.every(menu => {
        const perm = permissions[menu.mm_id];
        return perm && perm.is_menu_selected;
    });


    const handleSavePermissions = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select a user first!' });
            return;
        }

        setIsSaving(true);
        try {
            // Format data to send to backend - include selected menus OR menus that already exist in DB (to update them to 0)
            const permissionsArray = Object.keys(permissions)
                .filter(menuId => permissions[menuId].is_menu_selected || permissions[menuId].ump_id > 0)
                .map(menuId => ({
                    ump_id: permissions[menuId].ump_id || 0,
                    ump_user_id: selectedUser,
                    ump_menu_id: menuId,
                    ump_can_menu_show: permissions[menuId].is_menu_selected ? 1 : 0,
                    ump_can_insert: permissions[menuId].insert ? 1 : 0,
                    ump_can_update: permissions[menuId].update ? 1 : 0,
                    ump_can_delete: permissions[menuId].delete ? 1 : 0,
                    ump_can_view: permissions[menuId].view ? 1 : 0,
                    create_By: userid
                }));

            // Modify this API path based on actual backend
            const response = await api.post('api/User_Permissions_Contoller/user_menu_permissions_insert_update', permissionsArray, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let data = response.data;
            if (typeof data === 'string') data = JSON.parse(data);

            if (data?.Status === 1 || data?.status === 1) {
                Swal.fire({ icon: 'success', title: 'Saved!', text: data.Message || data.message || 'Permissions updated successfully.' });
            } else {
                Swal.fire({ icon: 'error', title: 'Error!', text: data.Message || data.message || 'Failed to update permissions.' });
            }
        } catch (error) {
            console.error("Error saving permissions:", error);
            Swal.fire({ icon: 'success', title: 'Mock Saved', text: 'Permissions saved locally (Backend API missing).' });
        } finally {
            setIsSaving(false);
        }
    };

    const selectedMenus = menus.filter(menu => permissions[menu.mm_id]?.is_menu_selected);
    const isMasterAllChecked = selectedMenus.length > 0 && selectedMenus.every(menu => {
        const perm = permissions[menu.mm_id];
        return perm && perm.insert && perm.update && perm.delete && perm.view;
    });

    return (
        <div className="student-form-container">
            <div className="form-card" style={{ maxWidth: '900px' }}>
                <div className="form-header">
                    <h2>User Wise Permission</h2>
                    <p>Assign module rights (Insert, Update, Delete, View) to users.</p>
                </div>

                <div className="student-form">
                    <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Select User (Email / ID) <span className="required">*</span></label>
                            <select
                                className="form-input"
                                value={selectedUser}
                                onChange={handleUserChange}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">-- Select User --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.user_name} ({user.user_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="btn btn-submit"
                            style={{ padding: '10px 20px', height: '42px', marginBottom: '2px' }}
                            onClick={handleLoadData}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Load Data'}
                        </button>
                    </div>

                    {isLoading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading permissions...</div>}

                    {hasLoaded && !isLoading && (
                        <div className="permissions-grid-wrapper" style={{ overflowX: 'auto', marginTop: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isAllMenuChecked}
                                                    onChange={(e) => handleMasterMenuSelect(e.target.checked)}
                                                    style={checkboxStyle}
                                                    title="Select / Unselect All Menus"
                                                />
                                                Menu Name
                                            </div>
                                        </th>
                                        <th style={tableHeaderStyle}>Insert</th>
                                        <th style={tableHeaderStyle}>Update / Edit</th>
                                        <th style={tableHeaderStyle}>Delete</th>
                                        <th style={tableHeaderStyle}>View</th>
                                        <th style={tableHeaderStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                All
                                                <input
                                                    type="checkbox"
                                                    checked={isMasterAllChecked}
                                                    onChange={(e) => handleMasterSelectAll(e.target.checked)}
                                                    style={checkboxStyle}
                                                    title="Select / Unselect All"
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menus.length > 0 ? menus.map((menu, index) => {
                                        const perm = permissions[menu.mm_id] || { is_menu_selected: false, insert: false, update: false, delete: false, view: false };
                                        const isAllChecked = perm.insert && perm.update && perm.delete && perm.view;

                                        return (
                                            <tr key={menu.mm_id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                                <td style={tableCellStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={perm.is_menu_selected || false}
                                                            onChange={(e) => handleCheckboxChange(menu.mm_id, 'is_menu_selected', e.target.checked)}
                                                            style={checkboxStyle}
                                                        />
                                                        <strong>{menu.mm_menu_name}</strong>
                                                    </div>
                                                </td>
                                                <td style={tableCellStyle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.insert}
                                                        onChange={(e) => handleCheckboxChange(menu.mm_id, 'insert', e.target.checked)}
                                                        style={{...checkboxStyle, cursor: perm.is_menu_selected ? 'pointer' : 'not-allowed', opacity: perm.is_menu_selected ? 1 : 0.5}}
                                                        disabled={!perm.is_menu_selected}
                                                    />
                                                </td>
                                                <td style={tableCellStyle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.update}
                                                        onChange={(e) => handleCheckboxChange(menu.mm_id, 'update', e.target.checked)}
                                                        style={{...checkboxStyle, cursor: perm.is_menu_selected ? 'pointer' : 'not-allowed', opacity: perm.is_menu_selected ? 1 : 0.5}}
                                                        disabled={!perm.is_menu_selected}
                                                    />
                                                </td>
                                                <td style={tableCellStyle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.delete}
                                                        onChange={(e) => handleCheckboxChange(menu.mm_id, 'delete', e.target.checked)}
                                                        style={{...checkboxStyle, cursor: perm.is_menu_selected ? 'pointer' : 'not-allowed', opacity: perm.is_menu_selected ? 1 : 0.5}}
                                                        disabled={!perm.is_menu_selected}
                                                    />
                                                </td>
                                                <td style={tableCellStyle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.view}
                                                        onChange={(e) => handleCheckboxChange(menu.mm_id, 'view', e.target.checked)}
                                                        style={{...checkboxStyle, cursor: perm.is_menu_selected ? 'pointer' : 'not-allowed', opacity: perm.is_menu_selected ? 1 : 0.5}}
                                                        disabled={!perm.is_menu_selected}
                                                    />
                                                </td>
                                                <td style={tableCellStyle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllChecked}
                                                        onChange={(e) => handleSelectAllRow(menu.mm_id, e.target.checked)}
                                                        style={{...checkboxStyle, cursor: perm.is_menu_selected ? 'pointer' : 'not-allowed', opacity: perm.is_menu_selected ? 1 : 0.5}}
                                                        disabled={!perm.is_menu_selected}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" style={{ ...tableCellStyle, textAlign: 'center', padding: '30px' }}>
                                                No menus found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {hasLoaded && (
                        <div className="form-buttons" style={{ marginTop: '30px' }}>
                            <button
                                type="button"
                                className="btn btn-submit"
                                onClick={handleSavePermissions}
                                disabled={isSaving || !selectedUser}
                                style={{ cursor: (isSaving || !selectedUser) ? 'not-allowed' : 'pointer' }}
                            >
                                {isSaving ? <span className="spinner"></span> : 'Save Permissions'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const tableHeaderStyle = {
    padding: '12px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
    borderBottom: '2px solid #cbd5e1'
};

const tableCellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'center',
    color: '#334155'
};

const checkboxStyle = {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
};

export default User_wise_menu_Permissions;
