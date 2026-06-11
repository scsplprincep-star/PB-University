using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using Student_api.Student_Information.BAL;
using System.Data;
using static Student_api.Master_page.Contollers.City_Master_Contoller.CommonResponse;


namespace Student_api.Master_page.Contollers
{
    [ApiController]
    [Route("api/[controller]")]
    public class City_Master_Contoller : ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }
        }
        public class countrymasterModel
        {
            public int cim_id { get; set; }
            public int create_by { get; set; }
            public int cim_country_id { get; set; }
            public int cim_state_id { get; set; }
            public string cim_city_name { get; set; }
            public int cim_is_status { get; set; }
        }
        [HttpPost]
        [Route("city_master_insert_update")]
        public IActionResult Insert([FromForm] countrymasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_City_Master.city_master_insert_update(
                model.cim_id,                   
                model.create_by,
                model.cim_country_id,
                model.cim_state_id,
                model.cim_city_name,
                model.cim_is_status


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
        [Route("state_master_search")]
        public string state_master_search(int sm_country_id, string searchtrums)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_City_Master.state_master_search(sm_country_id, searchtrums);
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
        [Route("city_master_select_all")]
        public string city_master_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_City_Master.city_master_select_all( );
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
        [Route("city_master_select_by_id")]
        public string city_master_select_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_City_Master.city_master_select_by_id(id);
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
        [Route("city_master_delete")]
        public string city_master_delete(int id, int user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_City_Master.city_master_delete(id, user_id);
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
