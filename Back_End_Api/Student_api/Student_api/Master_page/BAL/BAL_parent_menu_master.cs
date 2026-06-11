using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_parent_menu_master
    {
        public static DataTable parent_menu_master_insert(
      int create_by,
      string pmm_menu_name,
      string pmm_menu_icon,
      int pmm_is_status
  )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "parent_menu_master_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@create_by", create_by));
            cmd.Parameters.Add(para.StringInputPara("@pmm_menu_name", pmm_menu_name));
            cmd.Parameters.Add(para.StringInputPara("@pmm_menu_icon", pmm_menu_icon));
            cmd.Parameters.Add(para.IntInputPara("@pmm_is_status", pmm_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable parent_menu_master_update(
      int pmm_id,
      int create_by,
      string pmm_menu_name,
      string pmm_menu_icon,
      int pmm_is_status
  )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "parent_menu_master_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@pmm_id", pmm_id));
            cmd.Parameters.Add(para.IntInputPara("@create_by", create_by));
            cmd.Parameters.Add(para.StringInputPara("@pmm_menu_name", pmm_menu_name));
            cmd.Parameters.Add(para.StringInputPara("@pmm_menu_icon", pmm_menu_icon));
            cmd.Parameters.Add(para.IntInputPara("@pmm_is_status", pmm_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable parent_menu_master_select_all()
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "parent_menu_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable parent_menu_master_by_id(int id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "parent_menu_master_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable parent_menu_master_delete(int id,int user_id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "parent_menu_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}
