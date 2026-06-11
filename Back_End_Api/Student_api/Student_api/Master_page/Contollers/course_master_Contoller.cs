using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using System.Data;
using static Student_api.Master_page.Contollers.course_master_Contoller;

namespace Student_api.Master_page.Contollers
{

    [ApiController]
    [Route("api/[controller]")]
    public class course_master_Contoller : ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }
        }
        public class coursemasterModel
        {
            public int cm_id { get; set; }
            public string cm_course_name { get; set; }
            public string cm_course_code { get; set; }
            public int cm_duration_year { get; set; }
            public int cm_is_status { get; set; }

            public int create_By { get; set; }
        }

        [HttpPost]
        [Route("course_master_insert_update")]
        public IActionResult Insert([FromForm] coursemasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_course_master.course_master_insert_update(
                model.cm_id,
                model.create_By,
                model.cm_course_name,
                model.cm_course_code,
                model.cm_duration_year,
                model.cm_is_status


                );

                if (dt != null && dt.Rows.Count > 0)
                {
                    cd.Status = Convert.ToInt32(dt.Rows[0]["Status"]);
                    cd.Message = dt.Rows[0]["Message"].ToString();
                    cd.Result = dt;
                }
                else
                {
                    cd.Status = 0;
                    cd.Message = "Something went wrong.";
                    cd.Result = null;
                }
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = ex.Message;
                cd.Result = null;
            }

            return Content(JsonConvert.SerializeObject(cd), "application/json");
        }

        [HttpGet]
        [Route("course_master_select_all")]
        public string course_master_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_course_master.course_master_select_all();
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
        [Route("course_master_select_all_by_id")]
        public string course_master_select_all_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_course_master.course_master_select_all_by_id(id);
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
        [Route("course_master_delete")]
        public string course_master_delete(int id,int user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_course_master.course_master_delete(id,user_id);
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
}
