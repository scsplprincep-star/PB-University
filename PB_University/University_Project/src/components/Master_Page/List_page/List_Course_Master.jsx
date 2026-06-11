import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../back_end_url/api_url";
import Grid from "../../Grid";
import Swal from "sweetalert2";
import { TextAlignCenter } from "lucide-react";


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
        cm_id: record?.cm_id ?? null,
        create_date: formatDateValue(record?.["create_date"], true),
        user_id: record?.["create_by"],
        cm_course_name: record?.["cm_course_name"],
        cm_course_code: record?.["cm_course_code"],
        cm_duration_year: record?.["cm_duration_year"],
        status: record?.["status"],
    }));
};

const STUDENT_DATA_FIELDS = [
    { name: "cm_course_name", type: "int" },
    { name: "cm_course_code", type: "string" },
    { name: "cm_duration_year", type: "int" },
    { name: "status", type: "string" },
    { name: "create_date", type: "string" },
    { name: "user_id", type: "string" },
];

const STUDENT_COLUMNS = [
    { text: "Course Name", datafield: "cm_course_name", width: 180 },
    { text: "Course Code", datafield: "cm_course_code", width: 180 },
    { text: "Duration (in Years)", datafield: "cm_duration_year", width: 180 },
    {
        text: "Status",
        datafield: "status",
        width: 180,
    },
    {
        text: "Create Date",
        datafield: "create_date",
        width: 180
    },
    {
        text: "Create By",
        datafield: "user_id",
        width: 180
    },
];

const hasValidId = (value) => value !== null && value !== undefined && value !== "";

function List_Course_Master() {
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
                "api/course_master_Contoller/course_master_select_all",
            );

            let normalizedData = normalizeStudents(payload);
            setStudents(normalizedData);
        } catch (loadError) {
            console.log("API Error", loadError);
            setError("Failed to load student records.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    const handelonView = (student) => {
        if (!hasValidId(student?.cm_id)) {
            return;
        }
        navigate(`/Course_Master?viewid=${student.cm_id}`);
    };
    const handelonEdit = (student) => {
        if (!hasValidId(student?.cm_id)) {
            return;
        }
        navigate(`/Course_Master?id=${student.cm_id}`);
    };

    const handelondelete = async (student) => {
        if (!hasValidId(student?.cm_id)) {
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
                Swal.fire("Deleted!", "The Course record has been deleted.", "success");
            }
        });
    };

    const deleteStudent = async (student) => {
        try {
            await api.get(
                "/api/course_master_Contoller/course_master_delete",
                {
                    params: {
                        id: student.cm_id,
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
            title="Course List"
            addbuttonLabel="Add Course"
            rows={students}
            columns={STUDENT_COLUMNS}
            dataFields={STUDENT_DATA_FIELDS}
            isLoading={isLoading}
            error={error}
            onReload={loadStudents}
            onAdd={() => navigate('/Course_Master')}
            onView={handelonView}
            onEdit={handelonEdit}
            onDelete={handelondelete}
            toolbarPosition="top"
            gridProps={{ pageable: true, sortable: true, filterable: true, autoheight: true, columnsresize: true, altrows: true }}
        />
    )
}

export default List_Course_Master
