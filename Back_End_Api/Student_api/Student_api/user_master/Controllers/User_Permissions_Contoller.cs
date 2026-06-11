using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Student_api.Master_page.BAL;
using Student_api.user_master.BAL;
using System.Data;
using static Student_api.Master_page.Contollers.menu_master_Contoller.CommonResponse;
using static Student_api.user_master.Controllers.User_Permissions_Contoller.CommonResponse;


namespace Student_api.user_master.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class User_Permissions_Contoller : ControllerBase
    { 
    public class CommonResponse
    {
        public int Status { get; set; }
        public string Message { get; set; }
        public object Result { get; set; }

        public class UserPermissionModel
            {
            public int ump_id { get; set; }
            public int ump_user_id { get; set; }
            public int ump_menu_id { get; set; }
            public int ump_can_insert { get; set; }
            public int ump_can_update { get; set; }

            public int ump_can_delete { get; set; }
            public int ump_can_view { get; set; }
            public int create_By { get; set; }
            public int ump_can_menu_show { get; set; }



            }
        }
        [HttpGet]
        [Route("user_master_select_all")]
        public string user_master_select_all( )
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_User_Permissions.user_master_select_all( );
                cd.Status = 1;
                cd.Message = "Data GET Successfully";
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

        [HttpPost]
        [Route("user_menu_permissions_insert_update")]
        public IActionResult Insert([FromBody] List<UserPermissionModel> models)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                foreach (var model in models)
                {
                    DataTable dt = BAL_User_Permissions.user_menu_permissions_insert_update(
                        model.ump_id,
                        model.ump_user_id,
                        model.ump_menu_id,
                        model.ump_can_insert,
                        model.ump_can_update,
                        model.ump_can_delete,
                        model.ump_can_view,
                        model.create_By,
                        model.ump_can_menu_show
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
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = ex.Message;
                cd.Result = null;
            }

            return Content(JsonConvert.SerializeObject(cd), "application/json");
        }
    }
}
