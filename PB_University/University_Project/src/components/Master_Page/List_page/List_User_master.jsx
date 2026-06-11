import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../back_end_url/api_url";
import Grid from "../../Grid";
import Swal from "sweetalert2";


const padTwoDigits = (value) => String(value).padStart(2, "0");

const formatDateValue = (value, withTime = false) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const baseDate = `${padTwoDigits(date.getDate())}-${padTwoDigits(date.getMonth() + 1)}-${date.getFullYear()}`;

    if (!withTime) {
        return baseDate;
    }

    const time = `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}:${padTwoDigits(date.getSeconds())}`;
    return `${baseDate} ${time}`;
};

const normalizeStudents = (payload) => {
    const records = Array.isArray(payload?.Result)
        ? payload.Result
        : Array.isArray(payload)
            ? payload
            : [];

    return records.map((record) => ({
        um_id: record?.id ?? null,
        um_email_id: record?.["user_id"] ?? "",
        um_user_name: record?.["user_name"] ?? "",
        Roleid: record?.["Login_id"] ?? "",
        create_date: formatDateValue(record?.["Create_date"], true),
        Modify_date: formatDateValue(record?.["modifiy_date"], true),

    }));
};

const STUDENT_DATA_FIELDS = [
    { name: "um_email_id", type: "string" },
    { name: "um_user_name", type: "string" },
    { name: "Roleid", type: "string" },
    { name: "create_date", type: "string" },
    { name: "Modify_date", type: "string" },


];

const STUDENT_COLUMNS = [
    { text: "Email Id", datafield: "um_email_id", width: 180 },
    { text: "User Name", datafield: "um_user_name", width: 180 },
    {
        text: "Role Id",
        datafield: "Roleid",
        width: 180,
    },
    {
        text: "Create Date",
        datafield: "create_date",
        width: 180
    },
    {
        text: "Modify Date",
        datafield: "Modify_date",
        width: 180
    },

];

const hasValidId = (value) => value !== null && value !== undefined && value !== "";

function List_User_master() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userid = searchParams.get('userId') || storedUser.um_id;
    const EmailId = searchParams.get('userEmail') || storedUser.um_email_id;
    const userlogin = searchParams.get('userName') || storedUser.um_user_name;
    const Roleid = searchParams.get('userId') || storedUser.login_id;
    const isAdmin = Roleid === 1 || Roleid === '1';
    const loadStudents = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data: payload } = await api.get(
                "api/User_Permissions_Contoller/user_master_select_all",
            );
            let normalizedData = normalizeStudents(payload);
            // if (!isAdmin) {
            //     normalizedData = normalizedData.filter(item => {
            //         const creator = item.create_by || item.user_id;
            //         return creator == userid || creator == userlogin || creator == EmailId;
            //     });
            // }
            setStudents((normalizedData));
        } catch (loadError) {
            console.log("API Error", loadError);
            setError("Failed to load student records.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handelonView = (student) => {
        if (!hasValidId(student?.um_id)) {
            return;
        }
        navigate(`/User_master?viewid=${student.um_id}`);
    };

    const handelonEdit = (student) => {
        if (!hasValidId(student?.um_id)) {
            return;
        }
        navigate(`/User_master?id=${student.um_id}`);
    };

    const handelondelete = async (student) => {
        if (!hasValidId(student?.um_id)) {
            setError("Invalid student ID.");
            return;
        }
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteStudent(student);
                Swal.fire("Deleted!", "The User record has been deleted.", "success");
            }
        });
    };

    const deleteStudent = async (student) => {
        try {
            await api.get(
                "api/user_master_pagecs_/user_master_delete",
                {
                    params: {
                        id: student.um_id,
                    },
                }
            );

            await loadStudents();

        } catch (loadError) {
            console.error("API Error", loadError);
            setError("Failed to delete student record.");
        }
    };



    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    return (
        <Grid
            title="User List"
            addbuttonLabel="Add User"
            rows={students}
            columns={STUDENT_COLUMNS}
            dataFields={STUDENT_DATA_FIELDS}
            isLoading={isLoading}
            error={error}
            onReload={loadStudents}
            onAdd={() => navigate('/User_master')}
            onView={handelonView}
            onEdit={handelonEdit}
            onDelete={handelondelete}
            toolbarPosition="top"
            gridProps={{ pageable: true, sortable: true, filterable: true, autoheight: true, columnsresize: true, altrows: true }}
        />
    )
}

export default List_User_master