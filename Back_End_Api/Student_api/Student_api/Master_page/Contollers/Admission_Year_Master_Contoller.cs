using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using System.Data;

namespace Student_api.Master_page.Contollers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Admission_Year_Master_Contoller :ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }
        }
        public class admissionyearmasterModel
        {
            public int aym_id { get; set; }
            public string aym_admission_year { get; set; }
            public int aym_is_status { get; set; }
            public int create_By { get; set; }
        }

        [HttpPost]
        [Route("admission_year_master_insert_update")]
        public IActionResult Insert([FromForm] admissionyearmasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_Admission_Year_Master.admission_year_master_insert_update(
                model.aym_id,
                model.aym_admission_year,
                model.aym_is_status,
                model.create_By


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
        [Route("admission_year_master_select_all")]
        public string admission_year_master_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_Admission_Year_Master.admission_year_master_select_all();
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
        [Route("admission_year_master_select_by_id")]
        public string admission_year_master_select_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_Admission_Year_Master.admission_year_master_select_by_id(id);
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
        [Route("admission_year_master_delete")]
        public string admission_year_master_delete(int id,int user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_Admission_Year_Master.admission_year_master_delete(id, user_id);
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
