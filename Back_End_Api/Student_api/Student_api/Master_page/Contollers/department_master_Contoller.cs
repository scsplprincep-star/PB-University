using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using System.Data;

namespace Student_api.Master_page.Contollers
{
    [ApiController]
    [Route("api/[controller]")]
    public class department_master_Contoller : ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }
        }
        public class departmentmasterModel
        {
            public int dm_id { get; set; }
            public string dm_department_name { get; set; }
            public int dm_is_status { get; set; }
            public int create_By { get; set; }
        }

        [HttpPost]
        [Route("department_master_insert_update")]
        public IActionResult Insert([FromForm] departmentmasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_department_master.department_master_insert_update(
                model.dm_id,
                model.create_By,
                model.dm_department_name,
                model.dm_is_status


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
        [Route("department_master_select_all")]
        public string department_master_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_department_master.department_master_select_all();
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
        [Route("department_master_select_by_id")]
        public string department_master_select_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_department_master.department_master_select_by_id(id);
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
        [Route("department_master_delete")]
        public string department_master_delete(int id, int user_id )
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_department_master.department_master_delete(id, user_id);
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
