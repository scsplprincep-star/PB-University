using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_Semester_Master
    {
        public static DataTable semester_master_insert_update(
  int sm_id,
  int create_By,
  string sm_semester_name,
  int sm_is_status
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "semester_master_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@sm_id", sm_id));
            cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));
            cmd.Parameters.Add(para.StringInputPara("@sm_semester_name", sm_semester_name));
            cmd.Parameters.Add(para.IntInputPara("@sm_is_status", sm_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable semester_master_select_all(
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "semester_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable semester_master_select_by_id(
            int id 
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "semester_master_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));


            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable semester_master_delete(
            int id,
            int user_id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "semester_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));


            return CreateCommand.ExecuteQuery(cmd);
        }
       
    }
}
