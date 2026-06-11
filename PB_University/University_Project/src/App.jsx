import React from "react";
import { Routes, Route } from "react-router-dom";
import Login_page from "./components/screen/Login_page";
import User_master from "./components/Master_Page/User_master";
import Student_personal_information from "./components/Student_Information_Page/Student_personal_information";
import List_Student_personal_information from "./components/Student_Information_Page/List_page/List_Student_personal_information";
import ProtectedRoute from "./components/back_end_url/ProtectedRoute";
import Sidebar from "./components/screen/Sidebar";
import AddStudentForm from "./components/Student_Information_Page/AddStudentForm";
import Country_Master from "./components/Master_Page/Country_Master";
import State_Master from "./components/Master_Page/State_Master";
import City_Master from "./components/Master_Page/City_Master";
import List_country_master from "./components/Master_Page/List_page/List_country_master";
import Searchtrums from "./components/Type&search/Searchtrums";
import List_state_master from "./components/Master_Page/List_page/List_state_master";
import Menu_Master from "./components/Menu&Menu_Permissions/Menu_Master";
import List_Menu_Master from "./components/Menu&Menu_Permissions/List_page/List_Menu_Master";
import List_City_Master from "./components/Master_Page/List_page/List_City_Master";
import List_Add_Student_Form from "./components/Student_Information_Page/List_page/List_Add_Student_Form";
import User_wise_menu_Permissions from "./components/Menu&Menu_Permissions/User_wise_menu_Permissions";
import List_User_master from "./components/Master_Page/List_page/List_User_master";
import Parent_menu_master from "./components/Menu&Menu_Permissions/Parent_menu_master";
import List_parent_menu_master from "./components/Menu&Menu_Permissions/List_page/List_parent_menu_master";
import Admission_year_Master from "./components/Master_Page/Admission_year_Master";
import List_Admission_year_Master from "./components/Master_Page/List_page/List_Admission_year_Master";
import Semester_Master from "./components/Master_Page/Semester_Master";
import List_Semester_Master from "./components/Master_Page/List_page/List_Semester_Master";
import Department_Master from "./components/Master_Page/Department_Master";
import List_Department_Master from "./components/Master_Page/List_page/List_Department_Master";
import Course_Master from "./components/Master_Page/Course_Master";
import List_Course_Master from "./components/Master_Page/List_page/List_Course_Master";
import Convert_Img_to_Execl from "./components/Master_Page/Convert_Img_to_Execl";
import Convert_pdf_to_Table from "./components/Master_Page/Convert_pdf_to_Table";
import Welcome_Screen from "./components/screen/Welcome_Screen";

function App() {
  return (
    <Routes>
      {/* FROM */}
      <Route path="/" element={<Login_page />} />
      <Route element={<ProtectedRoute>< Sidebar /></ProtectedRoute>}>
        <Route path="/user_master" element={<User_master />} />
        <Route path="/student_personal_information" element={<Student_personal_information />} />
        <Route path="/Add_Student_Form" element={<AddStudentForm />} />
        <Route path="/State_Master" element={<State_Master />} />
        <Route path="/Country_Master" element={<Country_Master />} />
        <Route path="/City_Master" element={<City_Master />} />
        <Route path="/Searchtrums" element={< Searchtrums />} />
        <Route path="/Menu_Master" element={<Menu_Master />} />
        <Route path="/Parent_menu_master" element={<Parent_menu_master />} />
        <Route path="/User_wise_menu_Permissions" element={<User_wise_menu_Permissions />} />
        <Route path="/Admission_year_Master" element={<Admission_year_Master />} />
        <Route path="/Department_Master" element={<Department_Master />} />
        <Route path="/Semester_Master" element={<Semester_Master />} />
        <Route path="/Course_Master" element={<Course_Master />} />
        <Route path="/Convert_Img_to_Execl" element={<Convert_Img_to_Execl />} />
        <Route path="/Convert_pdf_to_Table" element={<Convert_pdf_to_Table />} />
        <Route path="/Welcome_Screen" element={<Welcome_Screen />} />

        {/* List pages */}
        <Route path="/List_country_master" element={< List_country_master />} />
        <Route path="/List_state_master" element={< List_state_master />} />
        <Route path="/List_City_Master" element={< List_City_Master />} />
        <Route path="/List_User_master" element={<List_User_master />} />
        <Route path="/List_Menu_Master" element={< List_Menu_Master />} />
        <Route path="/List_Admission_year_Master" element={< List_Admission_year_Master />} />
        <Route path="/List_Semester_Master" element={< List_Semester_Master />} />
        <Route path="/List_Add_Student_Form" element={< List_Add_Student_Form />} />
        <Route path="/list_student_personal_information" element={<List_Student_personal_information />} />
        <Route path="/List_parent_menu_master" element={<List_parent_menu_master />} />
        <Route path="/List_Department_Master" element={<List_Department_Master />} />
        <Route path="/List_Course_Master" element={<List_Course_Master />} />

      </Route>
    </Routes>
  );
}

export default App;