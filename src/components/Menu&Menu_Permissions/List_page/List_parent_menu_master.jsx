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
        pmm_id: record?.pmm_id ?? null,
        parent_menu_name: record?.["pmm_menu_name"] ?? "",
        parent_menu_icon: record?.["pmm_menu_icon"] ?? "",
        parent_menu_status: record?.["Status"] ?? "",
        create_date: formatDateValue(record?.["create_date"], true),
        create_by: record?.["um_user_name"]

    }));
};

const STUDENT_DATA_FIELDS = [
    { name: "parent_menu_name", type: "string" },
    { name: "parent_menu_icon", type: "string" },
    { name: "parent_menu_status", type: "string" },
    { name: "create_date", type: "string" },
    { name: "create_by", type: "string" },


];

const STUDENT_COLUMNS = [
    { text: "Parent Menu Name", datafield: "parent_menu_name", width: 180 },
    { text: "Parent Menu Icon", datafield: "parent_menu_icon", width: 180 },
    {
        text: "Status",
        datafield: "parent_menu_status",
        width: 180,
    },
    {
        text: "Create Date",
        datafield: "create_date",
        width: 180
    },
    {
        text: "Create By",
        datafield: "create_by",
        width: 180
    }
];

const hasValidId = (value) => value !== null && value !== undefined && value !== "";

function List_parent_menu_master() {
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
            const requestParams = isAdmin ? { create_By: userid } : {};
            const { data: payload } = await api.get(
                "api/parent_menu_master_Contoller/parent_menu_master_select_all",
                { params: requestParams }
            );

            let normalizedData = normalizeStudents(payload);
            // if (!isAdmin) {
            //     normalizedData = normalizedData.filter(item => {
            //         const creator = item.create_by || item.user_id;
            //         return creator == userid || creator == userlogin || creator == EmailId;
            //     });
            // }
            setStudents(normalizedData);
        } catch (loadError) {
            console.log("API Error", loadError);
            setError("Failed to load student records.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    const handelonView = (student) => {
        if (!hasValidId(student?.pmm_id)) {
            return;
        }
        navigate(`/Parent_menu_master?viewid=${student.pmm_id}`);
    };

    const handelonEdit = (student) => {
        if (!hasValidId(student?.pmm_id)) {
            return;
        }
        navigate(`/Parent_menu_master?id=${student.pmm_id}`);
    };

    const handelondelete = async (student) => {
        if (!hasValidId(student?.pmm_id)) {
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
                Swal.fire("Deleted!", "The Parent Menu record has been deleted.", "success");
            }
        });
    };

    const deleteStudent = async (student) => {
        try {
            await api.get(
                "api/parent_menu_master_Contoller/parent_menu_master_delete",
                {
                    params: {
                        id: student.pmm_id,
                        user_id: userid,
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
            title="Parent Menu Master"
            addbuttonLabel="Add Parent Menu"
            rows={students}
            columns={STUDENT_COLUMNS}
            dataFields={STUDENT_DATA_FIELDS}
            isLoading={isLoading}
            error={error}
            onReload={loadStudents}
            onAdd={() => navigate('/Parent_menu_master')}
            onView={handelonView}
            onEdit={handelonEdit}
            onDelete={handelondelete}
            toolbarPosition="top"
            gridProps={{ pageable: true, sortable: true, filterable: true, autoheight: true, columnsresize: true, altrows: true }}
        />
    )
}

export default List_parent_menu_master