using Microsoft.Data.SqlClient;
using System.Data;
using System;
using System.Collections.Generic;
using Student_api.DAL;
public class BAL_student_personal_information
{
    public static DataTable student_personal_information_insert(
        string stud_name,
        string stud_birth_date,
        int stud_gender,
        string stud_father_name,
        string stud_mother_name,
        int stud_user_id
    )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "student_personal_information_insert";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.StringInputPara("@stud_name", stud_name));
        cmd.Parameters.Add(para.StringInputPara("@stud_birth_date", stud_birth_date));
        cmd.Parameters.Add(para.IntInputPara("@stud_gender", stud_gender));
        cmd.Parameters.Add(para.StringInputPara("@stud_father_name", stud_father_name));
        cmd.Parameters.Add(para.StringInputPara("@stud_mother_name", stud_mother_name));
        cmd.Parameters.Add(para.IntInputPara("@stud_user_id", stud_user_id));

        return CreateCommand.ExecuteQuery(cmd);
    }
    public static DataTable student_personal_information_update(
        int stud_id,
        string stud_name,
        string stud_birth_date,
        int stud_gender,
        string stud_father_name,
        string stud_mother_name,
        int modfiy_by
    )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "student_personal_information_update";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.IntInputPara("@stud_id", stud_id));
        cmd.Parameters.Add(para.StringInputPara("@stud_name", stud_name));
        cmd.Parameters.Add(para.StringInputPara("@stud_birth_date", stud_birth_date));
        cmd.Parameters.Add(para.IntInputPara("@stud_gender", stud_gender));
        cmd.Parameters.Add(para.StringInputPara("@stud_father_name", stud_father_name));
        cmd.Parameters.Add(para.StringInputPara("@stud_mother_name", stud_mother_name));
        cmd.Parameters.Add(para.IntInputPara("@modfiy_by", modfiy_by));

        return CreateCommand.ExecuteQuery(cmd);
    }

    public static DataTable student_personal_information_select()
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "student_personal_information_select";
        cmd.CommandType = CommandType.StoredProcedure;

        return CreateCommand.ExecuteQuery(cmd);
    }

    public static DataTable student_personal_information_select_by_id(int id)
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "student_personal_information_select_by_id";
        cmd.Parameters.Add(para.IntInputPara("@id", id));
        cmd.CommandType = CommandType.StoredProcedure;

        return CreateCommand.ExecuteQuery(cmd);
    }

    public static DataTable student_personal_information_delete(int id,int stud_user_id)
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "student_personal_information_delete";
        cmd.Parameters.Add(para.IntInputPara("@id", id));
        cmd.Parameters.Add(para.IntInputPara("@stud_user_id", stud_user_id));
        cmd.CommandType = CommandType.StoredProcedure;

        return CreateCommand.ExecuteQuery(cmd);
    }
}
