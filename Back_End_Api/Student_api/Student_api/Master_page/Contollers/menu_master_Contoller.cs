using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using System.Data;
using static Student_api.Master_page.Contollers.menu_master_Contoller.CommonResponse;

namespace Student_api.Master_page.Contollers
{
    [ApiController]
    [Route("api/[controller]")]
    public class menu_master_Contoller : ControllerBase
    {
        public class CommonResponse
        {   
            public int Status { get; set; }
            public string Message { get; set; }
            public object Result { get; set; }

            public class menumasterModel
            {
                public int mm_id { get; set; }
                public int create_by { get; set; }
                public string mm_menu_name { get; set; }
                public string mm_menu_path { get; set; }
                public string mm_menu_icon { get; set; }

                public int mm_is_status { get; set; }
                public int mm_parent_menu_id { get; set; }

            }
        }

        [HttpPost]
        [Route("menu_master_insert")]
        public IActionResult Insert([FromForm] menumasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.menu_master_insert(
                    model.create_by,
                    model.mm_menu_name,
                    model.mm_menu_path,
                    model.mm_menu_icon,
                    model.mm_is_status,
                    model.mm_parent_menu_id
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
        [Route("menu_master_update")]
        public IActionResult update([FromForm] menumasterModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.menu_master_update(
                    model.mm_id,
                    model.create_by,
                    model.mm_menu_name,
                    model.mm_menu_path,
                    model.mm_menu_icon,
                    model.mm_is_status,
                    model.mm_parent_menu_id
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
        [Route("menu_master_select_all")]
        public string menu_master_select_all()
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.menu_master_select_all();
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
        [Route("menu_master_select_by_id")]
        public string menu_master_select_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.menu_master_select_by_id(id);
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
        [Route("menu_master_delete")]
        public string menu_master_delete(int id, int user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.menu_master_delete(id, user_id);
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
        [Route("user_menu_permissions_select_by_user_id")]
        public string user_menu_permissions_select_by_user_id(int ump_user_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.user_menu_permissions_select_by_user_id(ump_user_id);
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
        [Route("parent_menu_master_search")]
        public string parent_menu_master_search(string searchtrums)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_menu_master.parent_menu_master_search(searchtrums);
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
