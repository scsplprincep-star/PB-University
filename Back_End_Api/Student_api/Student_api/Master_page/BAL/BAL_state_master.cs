using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_state_master
    {
        public static DataTable state_master_insert(
        int create_by,
        int sm_country_id,
        string sm_state_name,
        int sm_is_status
    )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "state_master_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@create_by", create_by));
            cmd.Parameters.Add(para.IntInputPara("@sm_country_id", sm_country_id));
            cmd.Parameters.Add(para.StringInputPara("@sm_state_name", sm_state_name));
            cmd.Parameters.Add(para.IntInputPara("@sm_is_status", sm_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable state_master_update(
       int sm_id,
       int modfiy_by,
       int sm_country_id,
       string sm_state_name,
       int sm_is_status
   )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "state_master_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@sm_id", sm_id));
            cmd.Parameters.Add(para.IntInputPara("@modfiy_by", modfiy_by));
            cmd.Parameters.Add(para.IntInputPara("@sm_country_id", sm_country_id));
            cmd.Parameters.Add(para.StringInputPara("@sm_state_name", sm_state_name));
            cmd.Parameters.Add(para.IntInputPara("@sm_is_status", sm_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable state_master_select_all( )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "state_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;



            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable state_master_select_by_id(int id)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "state_master_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));


            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable state_master_delete(int id, int create_By)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "state_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));


            return CreateCommand.ExecuteQuery(cmd);
        }

    }
}
