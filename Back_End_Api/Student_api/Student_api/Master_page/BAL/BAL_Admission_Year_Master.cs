using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_Admission_Year_Master
    {
        public static DataTable admission_year_master_insert_update(
       int aym_id,
       string aym_admission_year,
       int aym_is_status,
       int create_By
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "admission_year_master_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@aym_id", aym_id));
            cmd.Parameters.Add(para.StringInputPara("@aym_admission_year", aym_admission_year));
            cmd.Parameters.Add(para.IntInputPara("@aym_is_status", aym_is_status));
            cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable admission_year_master_select_all(
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "admission_year_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable admission_year_master_select_by_id(
           int id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.CommandText = "admission_year_master_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable admission_year_master_delete(
           int id,
           int user_id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));
            cmd.CommandText = "admission_year_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

    }
}
