using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_course_master
    {
        public static DataTable course_master_insert_update(
int cm_id,
int create_By,
string cm_course_name,
string cm_course_code,
int cm_duration_year,
int cm_is_status
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "course_master_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@cm_id", cm_id));
            cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));
            cmd.Parameters.Add(para.StringInputPara("@cm_course_name", cm_course_name));
            cmd.Parameters.Add(para.StringInputPara("@cm_course_code", cm_course_code));
            cmd.Parameters.Add(para.IntInputPara("@cm_duration_year", cm_duration_year));
            cmd.Parameters.Add(para.IntInputPara("@cm_is_status", cm_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable course_master_select_all(
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "course_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable course_master_select_all_by_id(
          int id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "course_master_select_all_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable course_master_delete(
          int id,
          int user_id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "course_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}
