using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Master_page.BAL
{
    public class BAL_City_Master
    {
        public static DataTable state_master_search(
        int sm_country_id,
        string searchtrums
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "state_master_search";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@sm_country_id", sm_country_id));
            cmd.Parameters.Add(para.StringInputPara("@searchtrums", searchtrums));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable city_master_insert_update(
        int cim_id,
        int create_by,
        int cim_country_id,
        int cim_state_id,
        string cim_city_name,
        int cim_is_status
 )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "city_master_insert_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@cim_id", cim_id));
            cmd.Parameters.Add(para.IntInputPara("@create_by", create_by));
            cmd.Parameters.Add(para.IntInputPara("@cim_country_id", cim_country_id));
            cmd.Parameters.Add(para.IntInputPara("@cim_state_id", cim_state_id));
            cmd.Parameters.Add(para.StringInputPara("@cim_city_name", cim_city_name));
            cmd.Parameters.Add(para.IntInputPara("@cim_is_status", cim_is_status));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable city_master_select_all(
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "city_master_select_all";
            cmd.CommandType = CommandType.StoredProcedure;


            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable city_master_select_by_id(
        int id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "city_master_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable city_master_delete(
      int id,
      int user_id
)
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "city_master_delete";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}
