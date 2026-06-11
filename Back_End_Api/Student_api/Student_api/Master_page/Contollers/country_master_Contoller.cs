using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using System.Data;
using static Student_api.Master_page.Contollers.country_master_Contoller.CommonResponse;

namespace Student_api.Master_page.Contollers
{
    [ApiController]
    [Route("api/[controller]")]
    public class country_master_Contoller : ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }

            public class countrymasterModel
            {
                public int cm_id { get; set; }
                public string cm_country_name { get; set; }
                public int cm_is_status { get; set; }
                public int create_by { get; set; }
            }
        }

        [HttpPost]
        [Route("i_country_master_insert")]
        public IActionResult Insert([FromForm] countrymasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_country_master.i_country_master_insert(
                    model.cm_country_name,
                    model.cm_is_status,
                    model.create_by
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

        [HttpPost]
        [Route("country_master_update")]
        public IActionResult update([FromForm] countrymasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_country_master.country_master_update(
                    model.cm_id,
                    model.create_by,
                    model.cm_country_name,
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
        [Route("country_master_select_by_id")]
        public string country_master_select_by_id(int cm_id )
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_country_master.country_master_select_by_id(cm_id);
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
        [Route("country_master_select")]
        public string country_master_select( )
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_country_master.country_master_select( );
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
        [Route("country_master_delete")]
        public string country_master_delete(int id , int user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_country_master.country_master_delete(id, user_id);
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
