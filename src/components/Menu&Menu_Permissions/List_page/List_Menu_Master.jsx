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
        mm_id: record?.mm_id ?? null,
        menu_name: record?.["mm_menu_name"] ?? "",
        parent_menu_name: record?.["parent_menu"] ?? "",
        menu_path: record?.["mm_menu_path"] ?? "",
        menu_icon: record?.["mm_menu_icon"] ?? "",
        is_status: record?.["Status"] ?? "",
        create_date: formatDateValue(record?.["create_date"], true),
        create_by: record?.["um_user_name"]

    }));
};

const STUDENT_DATA_FIELDS = [
    { name: "menu_name", type: "string" },
    { name: "parent_menu_name", type: "string" },
    { name: "menu_path", type: "string" },
    { name: "menu_icon", type: "string" },
    { name: "is_status", type: "string" },
    { name: "create_date", type: "string" },
    { name: "create_by", type: "string" },


];

const STUDENT_COLUMNS = [
    { text: "Menu Name", datafield: "menu_name", width: 180 },
    { text: "Parent Menu Name", datafield: "parent_menu_name", width: 180 },
    { text: "Menu Path", datafield: "menu_path", width: 180 },
    { text: "Menu Icon", datafield: "menu_icon", width: 180 },
    {
        text: "Status",
        datafield: "is_status",
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

function List_Menu_Master() {
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
                "api/menu_master_Contoller/menu_master_select_all",
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
        if (!hasValidId(student?.mm_id)) {
            return;
        }
        navigate(`/Menu_Master?viewid=${student.mm_id}`);
    };

    const handelonEdit = (student) => {
        if (!hasValidId(student?.mm_id)) {
            return;
        }
        navigate(`/Menu_Master?id=${student.mm_id}`);
    };

    const handelondelete = async (student) => {
        if (!hasValidId(student?.mm_id)) {
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
                Swal.fire("Deleted!", "The Menu record has been deleted.", "success");
            }
        });
    };

    const deleteStudent = async (student) => {
        try {
            await api.get(
                "api/menu_master_Contoller/menu_master_delete",
                {
                    params: {
                        id: student.mm_id,
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
            title="Menu List"
            addbuttonLabel="Add Menu"
            rows={students}
            columns={STUDENT_COLUMNS}
            dataFields={STUDENT_DATA_FIELDS}
            isLoading={isLoading}
            error={error}
            onReload={loadStudents}
            onAdd={() => navigate('/Menu_Master')}
            onView={handelonView}
            onEdit={handelonEdit}
            onDelete={handelondelete}
            toolbarPosition="top"
            gridProps={{ pageable: true, sortable: true, filterable: true, autoheight: true, columnsresize: true, altrows: true }}
        />
    )
}

export default List_Menu_Master