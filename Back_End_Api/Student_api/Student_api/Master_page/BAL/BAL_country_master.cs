using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;
using Student_api.DAL;

namespace Student_api.Master_page.BAL
{
    public class BAL_country_master
    {
        public static DataTable i_country_master_insert(
       string cm_country_name,
       int cm_is_status,
       int create_by
   )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "i_country_master_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.StringInputPara("@cm_country_name", cm_country_name));
            cmd.Parameters.Add(para.IntInputPara("@cm_is_status", cm_is_status));
            cmd.Parameters.Add(para.IntInputPara("@create_by", create_by));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable country_master_select_by_id(
       int cm_id
   )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "country_master_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@cm_id", cm_id));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable country_master_select(
  )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "country_master_select";
            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable country_master_delete(
            int id,
            int user_id
  )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "country_master_delete";
            cmd.Parameters.Add(para.IntInputPara("@id", id));
            cmd.Parameters.Add(para.IntInputPara("@user_id", user_id));

            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable country_master_update(
           int cm_id,
           int modfiy_by,
           string cm_country_name,
           int cm_is_status
 )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "country_master_update";
            cmd.Parameters.Add(para.IntInputPara("@cm_id", cm_id));
            cmd.Parameters.Add(para.IntInputPara("@modfiy_by", modfiy_by));
            cmd.Parameters.Add(para.StringInputPara("@cm_country_name", cm_country_name));
            cmd.Parameters.Add(para.IntInputPara("@cm_is_status", cm_is_status));

            cmd.CommandType = CommandType.StoredProcedure;

            return CreateCommand.ExecuteQuery(cmd);
        }
    }
}
