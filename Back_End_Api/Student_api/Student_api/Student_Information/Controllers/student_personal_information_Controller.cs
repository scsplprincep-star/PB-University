using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Student_api.Student_Information.Controllers;
using Student_api.Student_Information.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace Student_api.Student_Information.Controllers
{
    public class CommonResponse
    {
        public int Status { get; set; }
        public string Message { get; set; }
        public object Result { get; set; }
    }
}

namespace Student_api.Student_Information.Models
{
    public class StudentPersonalInformationModel
    {
        public int stud_id { get; set; }
        public string stud_name { get; set; }
        public string stud_birth_date { get; set; }
        public int stud_gender { get; set; }
        public string stud_father_name { get; set; }
        public string stud_mother_name { get; set; }
        public int stud_user_id { get; set; }

    }
}

[Route("api/[controller]")]
public class student_personal_information_insert : ControllerBase
{
    [HttpPost]
    [Route("student_personal_information_insert")]
    public IActionResult Insert([FromForm] StudentPersonalInformationModel model)
    {
        CommonResponse cd = new CommonResponse();

        try
        {
            DataTable dt = BAL_student_personal_information.student_personal_information_insert(
                model.stud_name,
                model.stud_birth_date,
                model.stud_gender,
                model.stud_father_name,
                model.stud_mother_name,
                model.stud_user_id
            );

            cd.Status = 1;
            cd.Message = "Data Inserted Successfully";
            cd.Result = dt;
        }
        catch (Exception ex)
        {
            cd.Status = 0;
            cd.Message = "Error: " + ex.Message;
            cd.Result = null;
        }

        return Content(JsonConvert.SerializeObject(cd), "application/json");
    }


    [HttpPost]
    [Route("student_personal_information_update")]
    public IActionResult update([FromForm] StudentPersonalInformationModel model)
    {
        CommonResponse cd = new CommonResponse();

        try
        {
            DataTable dt = BAL_student_personal_information.student_personal_information_update(
                model.stud_id,
                model.stud_name,
                model.stud_birth_date,
                model.stud_gender,
                model.stud_father_name,
                model.stud_mother_name,
                model.stud_user_id
            );

            cd.Status = 1;
            cd.Message = "Data Inserted Successfully";
            cd.Result = dt;
        }
        catch (Exception ex)
        {
            cd.Status = 0;
            cd.Message = "Error: " + ex.Message;
            cd.Result = null;
        }

        return Content(JsonConvert.SerializeObject(cd), "application/json");
    }

    [HttpGet]
    [Route("student_personal_information_select")]
    public string student_personal_information_select()
    {
        CommonResponse cd = new CommonResponse();

        try
        {
            DataTable dt = BAL_student_personal_information.student_personal_information_select();
            cd.Status = 1;
            cd.Message = "Data Get Successfully";
            cd.Result = dt;
        }
        catch (Exception ex)
        {
            cd.Status = 0;
            cd.Message = "Error: " + ex.Message;
            cd.Result = null;
        }


        return JsonConvert.SerializeObject(cd);
    }

    [HttpGet]
    [Route("student_personal_information_select_by_id")]
    public string student_personal_information_select_by_id(int id)
    {
        CommonResponse cd = new CommonResponse();

        try
        {
            DataTable dt = BAL_student_personal_information.student_personal_information_select_by_id(id);
            cd.Status = 1;
            cd.Message = "Data Get Successfully";
            cd.Result = dt;
        }
        catch (Exception ex)
        {
            cd.Status = 0;
            cd.Message = "Error: " + ex.Message;
            cd.Result = null;
        }


        return JsonConvert.SerializeObject(cd);
    }

    [HttpGet]
    [Route("student_personal_information_delete")]
    public string student_personal_information_delete(int id, int stud_user_id)
    {
        CommonResponse cd = new CommonResponse();

        try
        {
            DataTable dt = BAL_student_personal_information.student_personal_information_delete(id, stud_user_id);
            cd.Status = 1;
            cd.Message = "Data Delete Successfully";
            cd.Result = dt;
        }
        catch (Exception ex)
        {
            cd.Status = 0;
            cd.Message = "Error: " + ex.Message;
            cd.Result = null;
        }


        return JsonConvert.SerializeObject(cd);
    }
}
