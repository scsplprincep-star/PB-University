using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_menu_master
    {
        public static DataTable menu_master_insert(
       int create_by,
       string mm_menu_name,
       string mm_menu_path,
       string mm_menu_icon,
       int mm_is_status,
       int mm_parent_menu_id
   )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "menu_master_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@create_by", create_by));
            cmd.Parameters.Add(para.StringInputPara("@mm_menu_name", mm_menu_name));
            cmd.Parameters.Add(para.StringInputPara("@mm_menu_path", mm_menu_path));
            cmd.Parameters.Add(para.StringInputPara("@mm_menu_icon", mm_menu_icon));
            cmd.Parameters.Add(para.IntInputPara("@mm_is_status", mm_is_status));
            cmd.Parameters.Add(para.IntInputPara("@mm_parent_menu_id", mm_parent_menu_id));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable menu_master_update(
     int mm_id,
     int modfiy_by,
     string mm_menu_name,
     string mm_menu_path,
     string mm_menu_icon,
     int mm_is_status,
     int mm_parent_menu_id
 )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "menu_master_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@mm_id", mm_id));
            cmd.Parameters.Add(para.IntInputPara("@modfiy_by", modfiy_by));
            cmd.Parameters.Add(para.StringInputPara("@mm_menu_name", mm_menu_name));
            cmd.Parameters.Add(para.StringInputPara("@mm_menu_path", mm_menu_path));
            cmd.Parameters.Add(para.StringInputPara("@mm_menu_icon", mm_menu_icon));
            cmd.Parameters.Add(para.IntInputPara("@mm_is_status", mm_is_status));
            cmd.Parameters.Add(para.IntInputPara("@mm_parent_menu_id", mm_parent_menu_id));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable menu_master_select_all()
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "menu_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable menu_master_select_by_id(int id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "menu_master_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));


            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable menu_master_delete(int id, int user_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "menu_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));


            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable user_menu_permissions_select_by_user_id(int ump_user_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "user_menu_permissions_select_by_user_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@ump_user_id", ump_user_id));


            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable parent_menu_master_search(string searchtrums)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "parent_menu_master_search";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.StringInputPara("@searchtrums", searchtrums));


            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}
