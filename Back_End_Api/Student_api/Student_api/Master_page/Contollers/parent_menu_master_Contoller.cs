using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using Student_api.DAL;
using Student_api.Master_page.BAL;
using System.Data;
using static Student_api.Master_page.Contollers.menu_master_Contoller.CommonResponse;
using static Student_api.Master_page.Contollers.parent_menu_master_Contoller.CommonResponse;

namespace Student_api.Master_page.Contollers
{
    [ApiController]
    [Route("api/[controller]")]
    public class parent_menu_master_Contoller : ControllerBase
    {
        public class CommonResponse
        {
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }

            public class parentmenumasterModel
            {
                public int pmm_id { get; set; }
                public int create_by { get; set; }
                public string pmm_menu_name { get; set; }
                public string pmm_menu_icon { get; set; }
                public int pmm_is_status { get; set; }

            }
        }
        [HttpPost]
        [Route("parent_menu_master_insert")]
        public IActionResult Insert([FromForm] parentmenumasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_parent_menu_master.parent_menu_master_insert(
                    model.create_by,
                    model.pmm_menu_name,
                    model.pmm_menu_icon,
                    model.pmm_is_status
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
        [Route("parent_menu_master_update")]
        public IActionResult update([FromForm] parentmenumasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_parent_menu_master.parent_menu_master_update(
                    model.pmm_id,
                    model.create_by,
                    model.pmm_menu_name,
                    model.pmm_menu_icon,
                    model.pmm_is_status
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
        [Route("parent_menu_master_select_all")]
        public string parent_menu_master_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_parent_menu_master.parent_menu_master_select_all();
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
        [Route("parent_menu_master_by_id")]
        public string parent_menu_master_by_id(int id )
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_parent_menu_master.parent_menu_master_by_id(id);
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
        [Route("parent_menu_master_delete")]
        public string parent_menu_master_delete(int id,int user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_parent_menu_master.parent_menu_master_delete(id, user_id);
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
