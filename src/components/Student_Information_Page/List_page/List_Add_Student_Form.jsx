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
    nsd_id: record?.nsd_id ?? null,
    First_Name: record?.["first_name"] ?? "",
    nsd_category: record?.["nsd_category"] ?? "",
    last_name: record?.["nsd_last_name"] ?? "",
    gender: record?.["gender"] ?? "",
    date_of_birth: record?.["date_of_birth"],
    nsd_age: record?.["nsd_age"] ?? "",
    nsd_mobile_number: record?.["nsd_mobile_number"] ?? "",
    nsd_email: record?.["nsd_email"] ?? "",
    sm_state_name: record?.["sm_state_name"] ?? "",
    cm_country_name: record?.["cm_country_name"] ?? "",
    cim_city_name: record?.["cim_city_name"] ?? "",
    nsd_pincode: record?.["nsd_pincode"] ?? "",
    stud_gender: genderLabel(record?.["Student Gender"]),
    stud_father_name: record?.["Student Father Name"] ?? "",
    stud_mother_name: record?.["Student Mother Name"] ?? "",
    stud_house_name: record?.["stud_house_name"] ?? "",
    stud_village: record?.["stud_village"] ?? "",
    stud_state_name: record?.["sm_state_name"] ?? "",
    stud_country_name: record?.["cm_country_name"] ?? "",
    stud_city_name: record?.["cim_city_name"] ?? "",
    stud_pincode: record?.["nsd_pincode"] ?? "",
    create_date: formatDateValue(record?.["create_date"], true),
    create_by: record?.["um_user_name"]
  }));
};

const STUDENT_DATA_FIELDS = [
  { name: "First_Name", type: "string" },
  { name: "nsd_category", type: "string" },
  { name: "last_name", type: "string" },
  { name: "gender", type: "string" },
  { name: "date_of_birth", type: "string" },
  { name: "nsd_age", type: "string" },
  { name: "nsd_mobile_number", type: "string" },
  { name: "nsd_email", type: "string" },
  { name: "sm_state_name", type: "string" },
  { name: "cm_country_name", type: "string" },
  { name: "cim_city_name", type: "string" },
  { name: "nsd_pincode", type: "string" },
  { name: "stud_gender", type: "string" },
  { name: "stud_father_name", type: "string" },
  { name: "stud_mother_name", type: "string" },
  { name: "stud_house_name", type: "string" },
  { name: "stud_village", type: "string" },
  { name: "stud_state_name", type: "string" },
  { name: "stud_country_name", type: "string" },
  { name: "stud_city_name", type: "string" },
  { name: "stud_pincode", type: "string" },
  { name: "stud_gender", type: "string" },
  { name: "stud_father_name", type: "string" },
  { name: "stud_mother_name", type: "string" },
  { name: "create_date", type: "string" },
  { name: "create_by", type: "string" }

];

const STUDENT_COLUMNS = [
  { text: "First Name", datafield: "First_Name", width: "auto" },
  {
    text: "Last Name",
    datafield: "last_name",
    width: "auto"
  },
  {
    text: "Gender",
    datafield: "gender",
    width: "auto"
  },
  {
    text: "Date Of Birth",
    datafield: "date_of_birth",
    width: "auto"
  },
  {
    text: "Age",
    datafield: "nsd_age",
    width: "auto"
  },
  {
    text: "Category",
    datafield: "nsd_category",
    width: "auto",
  },
  {
    text: "Mobile Number",
    datafield: "nsd_mobile_number",
    width: "auto"
  },
  {
    text: "Email ID",
    datafield: "nsd_email",
    width: "auto"
  },
  {
    text: "State Name",
    datafield: "sm_state_name",
    width: "auto"
  },
  {
    text: "Country Name",
    datafield: "cm_country_name",
    width: "auto"
  },
  {
    text: "City Name",
    datafield: "cim_city_name",
    width: "auto"
  },
  {
    text: "Pincode Number",
    datafield: "nsd_pincode",
    width: "auto"
  },

  {
    text: "Create By",
    datafield: "create_by",
    width: "auto"
  },
  {
    text: "Create Date",
    datafield: "create_date",
    width: "auto"
  },
];

const hasValidId = (value) => value !== null && value !== undefined && value !== "";

function List_Add_Student_Form() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userid = searchParams.get('userId') || storedUser.um_id;
  const EmailId = searchParams.get('userEmail') || storedUser.um_email_id;
  const userlogin = searchParams.get('userName') || storedUser.um_user_name;
  const Roleid = searchParams.get('loginid') || storedUser.login_id;
  const isAdmin = Roleid == 1 || Roleid == '1';

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const requestParams = isAdmin != 1 ? {} : { create_By: userid };
      const { data: payload } = await api.get(
        "api/new_student_details_contoller/new_student_details_select_all",
        { params: requestParams }

      );

      let normalizedData = normalizeStudents(payload);
      if (isAdmin != 1) {
        normalizedData = normalizedData.filter(item => {
          const creator = item.create_by || item.user_id;
          return creator == userid || creator == userlogin || creator == EmailId;
        });
      }
      setStudents(normalizedData);
    } catch (loadError) {
      console.log("API Error", loadError);
      setError("Failed to load student records.");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, userid, userlogin, EmailId]);

  const handelonView = (student) => {
    if (!hasValidId(student?.nsd_id)) {
      return;
    }
    navigate(`/Add_Student_Form?viewid=${student.nsd_id}`);
  };

  const handelonEdit = (student) => {
    if (!hasValidId(student?.nsd_id)) {
      return;
    }
    navigate(`/Add_Student_Form?id=${student.nsd_id}`);
  };

  const handelondelete = async (student) => {
    if (!hasValidId(student?.nsd_id)) {
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
        Swal.fire("Deleted!", "The Student record has been deleted.", "success");
      }
    });
  };

  const deleteStudent = async (student) => {
    try {
      await api.get(
        "api/student_personal_information_insert/student_personal_information_delete",
        {
          params: {
            id: student.nsd_id,
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
      title="List Of Add Student Form"
      rows={students}
      onAdd={() => navigate('/Add_Student_Form')}
      columns={STUDENT_COLUMNS}
      dataFields={STUDENT_DATA_FIELDS}
      isLoading={isLoading}
      error={error}
      onReload={loadStudents}
      onView={handelonView}
      onEdit={handelonEdit}
      onDelete={handelondelete}
      toolbarPosition="top"
      gridProps={{ pageable: true, sortable: true, filterable: true, autoheight: true, columnsresize: true, altrows: true }}
    />
  )
}

export default List_Add_Student_Form;