using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.user_master.BAL
{
    public class BAL_User_Permissions
    {
        public static DataTable user_master_select_all(
    )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "user_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

     public static DataTable user_menu_permissions_insert_update(
       int ump_id,
       int ump_user_id,
       int ump_menu_id,
       int ump_can_insert,
       int ump_can_update,
       int ump_can_delete,
       int ump_can_view,
       int create_By,
       int ump_can_menu_show


   )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "user_menu_permissions_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@ump_id", ump_id));
            cmd.Parameters.Add(para.IntInputPara("@ump_user_id", ump_user_id));
            cmd.Parameters.Add(para.IntInputPara("@ump_menu_id", ump_menu_id));
            cmd.Parameters.Add(para.IntInputPara("@ump_can_insert", ump_can_insert));
            cmd.Parameters.Add(para.IntInputPara("@ump_can_update", ump_can_update));
            cmd.Parameters.Add(para.IntInputPara("@ump_can_delete", ump_can_delete));
            cmd.Parameters.Add(para.IntInputPara("@ump_can_view", ump_can_view));
            cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));
            cmd.Parameters.Add(para.IntInputPara("@ump_can_menu_show", ump_can_menu_show));

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}
