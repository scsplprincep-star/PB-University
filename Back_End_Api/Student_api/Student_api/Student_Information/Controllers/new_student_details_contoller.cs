using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using Student_api.Student_Information.BAL;
using Student_api.Student_Information.Controllers;
using Student_api.Student_Information.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net.Mime;
using static Student_api.Student_Information.Controllers.new_student_details_contoller.CommonResponse;

namespace Student_api.Student_Information.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class new_student_details_contoller : ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }
        }

        public class newStudentDetailsModel
        {
            public int nsd_id { get; set; }
            public int create_By { get; set; }

            public string first_name { get; set; }
            public string nsd_category { get; set; }
            public string nsd_last_name { get; set; }

            public int nsd_gender { get; set; }
            public DateTime nsd_date_of_birth { get; set; }
            public int nsd_age { get; set; }

            // 👉 DB fields
            public string? nsd_profile_photo { get; set; }

            public string? nsd_original_profile_photo { get; set; }

            // 👉 File upload
            public IFormFile? ProfilePhotoFile { get; set; }

            public string nsd_mobile_number { get; set; }
            public string nsd_email { get; set; }

            public string nsd_address { get; set; }
            public int nsd_state_id { get; set; }
            public int nsd_country_id { get; set; }

            public string nsd_father_name { get; set; }
            public string nsd_mother_name { get; set; }

            public string nsd_parent_contact_number { get; set; }
            public string nsd_parent_email { get; set; }
            public int nsd_city_id { get; set; }
            public string nsd_pincode { get; set; }
            public string nsd_blood_group { get; set; }
            public string nsd_aadhar_card_number { get; set; }

        }

        [HttpPost]
        [Route("new_student_details_insert")]
        public IActionResult Insert([FromForm] newStudentDetailsModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                string dbPath = "";

                // 👉 Folder path
                string folderPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "Upload_Photo",
                    "student_Profile_Photo"
                );

                // 👉 Create folder if not exists
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                // 👉 Upload Image
                if (model.ProfilePhotoFile != null && model.ProfilePhotoFile.Length > 0)
                {
                    // 🔹 Clean student name
                    string studentName = model.first_name.Replace(" ", "").ToLower();

                    // 🔹 Time (Unique)
                    string timePart = DateTime.Now.ToString("yyyyMMddHHmmssfff");

                    // 🔹 Extension
                    string extension = Path.GetExtension(model.ProfilePhotoFile.FileName);

                    // 🔹 Final File Name
                    string fileName = studentName + timePart + extension;

                    // 🔹 Full Path
                    string fullPath = Path.Combine(folderPath, fileName);

                    // 🔹 Save File
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        model.ProfilePhotoFile.CopyTo(stream);
                    }

                    // 🔹 Save path for DB
                    dbPath = fileName;
                }

                DataTable dt = BAL_new_student_details.new_student_details_insert(
                    model.create_By,
                    model.first_name,
                    model.nsd_category,
                    model.nsd_last_name,
                    model.nsd_gender,
                    model.nsd_date_of_birth,
                    model.nsd_age,
                    model.nsd_original_profile_photo,
                    dbPath,
                    model.nsd_mobile_number,
                    model.nsd_email,
                    model.nsd_address,
                    model.nsd_state_id,
                    model.nsd_country_id,
                    model.nsd_father_name,
                    model.nsd_mother_name,
                    model.nsd_parent_contact_number,
                    model.nsd_parent_email,
                    model.nsd_city_id,
                    model.nsd_pincode,
                    model.nsd_blood_group,
                    model.nsd_aadhar_card_number
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
        [Route("new_student_details_update")]
        public IActionResult update([FromForm] newStudentDetailsModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                // 🔹 Keep old image by default
                string dbPath = model.nsd_profile_photo;

                // 🔹 Keep old original image name
                string originalFileName =
                    model.nsd_original_profile_photo;

                // 👉 Folder path
                string folderPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "Upload_Photo",
                    "student_Profile_Photo"
                );

                // 👉 Create folder if not exists
                if (model.ProfilePhotoFile != null &&
                model.ProfilePhotoFile.Length > 0)
                {
                    // REAL original uploaded file name
                    string uploadedOriginalName =
                        model.ProfilePhotoFile.FileName;

                    // remove full browser fakepath if exists
                    uploadedOriginalName =
                        Path.GetFileName(uploadedOriginalName);

                    // student name
                    string studentName =
                        model.first_name.Replace(" ", "").ToLower();

                    // unique time
                    string timePart =
                        DateTime.Now.ToString("yyyyMMddHHmmssfff");

                    // extension
                    string extension =
                        Path.GetExtension(uploadedOriginalName);

                    // encrypted file name
                    string encryptedFileName =
                        studentName + timePart + extension;

                    // full path
                    string fullPath =
                        Path.Combine(folderPath, encryptedFileName);

                    // save file
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        model.ProfilePhotoFile.CopyTo(stream);
                    }

                    // encrypted name for DB
                    dbPath = encryptedFileName;

                    // original uploaded name for DB
                    originalFileName = uploadedOriginalName;
                }


                    DataTable dt = BAL_new_student_details.new_student_details_update(
                    model.nsd_id,
                    model.create_By,
                    model.first_name,
                    model.nsd_category,
                    model.nsd_last_name,
                    model.nsd_gender,
                    model.nsd_date_of_birth,
                    model.nsd_age,
                    originalFileName,
                    dbPath,
                    model.nsd_mobile_number,
                    model.nsd_email,
                    model.nsd_address,
                    model.nsd_state_id,
                    model.nsd_country_id,
                    model.nsd_father_name,
                    model.nsd_mother_name,
                    model.nsd_parent_contact_number,
                    model.nsd_parent_email,
                    model.nsd_city_id,
                    model.nsd_pincode,
                    model.nsd_blood_group,
                    model.nsd_aadhar_card_number
                );

                cd.Status = 1;
                cd.Message = "Data Updated Successfully";
                cd.Result = dt;
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }

            return Content(
                JsonConvert.SerializeObject(cd),
                "application/json"
            );
        }

        [HttpGet]
        [Route("country_master_search")]
        public string country_master_search(string searchtrums)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_new_student_details.country_master_search(searchtrums);
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
        [Route("city_master_search")]
        public string city_master_search(string searchtrums)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_new_student_details.city_master_search(searchtrums);
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
        [Route("new_student_details_select_all")]
        public string new_student_details_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_new_student_details.new_student_details_select_all();
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
        [Route("new_student_details_select_by_id")]
        public string new_student_details_select_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_new_student_details.new_student_details_select_by_id(id);
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
    }
}


