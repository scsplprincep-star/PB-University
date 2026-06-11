import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../back_end_url/api_url";
import Grid from "../../Grid";
import Swal from "sweetalert2";

const genderLabel = (value) => {
  if (value === 1 || value === "1") {
    return "Male";
  }
  if (value === 2 || value === "2") {
    return "Female";
  }
  return value ?? "";
};

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
    stud_id: record?.stud_id ?? null,
    stud_name: record?.["Student Name"] ?? "",
    stud_birth_date: formatDateValue(record?.["Student Birth Date"]),
    stud_gender: genderLabel(record?.["Student Gender"]),
    stud_father_name: record?.["Student Father Name"] ?? "",
    stud_mother_name: record?.["Student Mother Name"] ?? "",
    create_date: formatDateValue(record?.["Create Date"], true),
    create_by: record?.["stud user id"]

  }));
};

const STUDENT_DATA_FIELDS = [
  { name: "stud_name", type: "string" },
  { name: "stud_birth_date", type: "string" },
  { name: "stud_gender", type: "string" },
  { name: "stud_father_name", type: "string" },
  { name: "stud_mother_name", type: "string" },
  { name: "create_date", type: "string" },
  { name: "create_by", type: "string" }

];

const STUDENT_COLUMNS = [
  { text: "Student Name", datafield: "stud_name", width: "auto" },
  {
    text: "Student Birth Date",
    datafield: "stud_birth_date",
    width: 180,
  },
  { text: "Student Gender", datafield: "stud_gender", width: "auto" },
  {
    text: "Student Father Name",
    datafield: "stud_father_name",
    width: "auto"
  },
  {
    text: "Student Mother Name",
    datafield: "stud_mother_name",
    width: "auto"
  },
  {
    text: "Create Date",
    datafield: "create_date",
    width: "auto"
  },
  {
    text: "Create By",
    datafield: "create_by",
    width: "auto"
  }
];

const hasValidId = (value) => value !== null && value !== undefined && value !== "";

function List_Student_personal_information() {
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

  const [userPermissions, setUserPermissions] = useState({ insert: true, update: true, delete: true, view: true });

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: payload } = await api.get(
        "api/student_personal_information_insert/student_personal_information_select"
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
  }, [isAdmin, userid, userlogin, EmailId]);

  const handelonView = (student) => {
    if (!hasValidId(student?.stud_id)) {
      return;
    }
    navigate(`/student_personal_information?viewid=${student.stud_id}`);
  };

  const handelonEdit = (student) => {
    if (!hasValidId(student?.stud_id)) {
      return;
    }
    navigate(`/student_personal_information?id=${student.stud_id}`);
  };

  const handelondelete = async (student) => {
    if (!hasValidId(student?.stud_id)) {
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
        Swal.fire("Deleted!", "The Student personal information record has been deleted.", "success");
      }
    });
  };

  const deleteStudent = async (student) => {
    try {
      await api.get(
        "api/student_personal_information_insert/student_personal_information_delete",
        {
          params: {
            id: student.stud_id,
            stud_user_id: userid,
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
      title="Student List"
      rows={students}
      onAdd={() => navigate('/student_personal_information')}
      columns={STUDENT_COLUMNS}
      dataFields={STUDENT_DATA_FIELDS}
      isLoading={isLoading}
      error={error}
      onReload={loadStudents}
      onView={handelonView}
      onEdit={handelonEdit}
      onDelete={handelondelete}
      userPermissions={userPermissions}
      toolbarPosition="top"
      gridProps={{ pageable: true, sortable: true, filterable: true, autoheight: true, columnsresize: true, altrows: true }}
    />
  );
}

export default List_Student_personal_information;