using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System.Data;

namespace Student_api.Student_Information.BAL
{
    public class BAL_new_student_details
    {
        public static DataTable country_master_search(
       string searchtrums
   )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "country_master_search";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.StringInputPara("@searchtrums", searchtrums));

            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable city_master_search(
        string searchtrums
        )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "city_master_search";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.StringInputPara("@searchtrums", searchtrums));

            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable new_student_details_insert(
     int create_By,
     string first_name,
     string nsd_category,
     string nsd_last_name,
     int nsd_gender,
     DateTime nsd_date_of_birth,
     int nsd_age,
     string nsd_original_profile_photo,
     string nsd_profile_photo,
     string nsd_mobile_number,
     string nsd_email,
     string nsd_address,
     int nsd_state_id,
     int nsd_country_id,
     string nsd_father_name,
     string nsd_mother_name,
     string nsd_parent_contact_number,
     string nsd_parent_email,
     int nsd_city_id,
     string nsd_pincode,
     string nsd_blood_group,
     string nsd_aadhar_card_number
 )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "new_student_details_insert";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));
            cmd.Parameters.Add(para.StringInputPara("@first_name", first_name));
            cmd.Parameters.Add(para.StringInputPara("@nsd_category", nsd_category));
            cmd.Parameters.Add(para.StringInputPara("@nsd_last_name", nsd_last_name));
            cmd.Parameters.Add(para.IntInputPara("@nsd_gender", nsd_gender));
            cmd.Parameters.Add(para.DateInputPara("@nsd_date_of_birth", nsd_date_of_birth));
            cmd.Parameters.Add(para.IntInputPara("@nsd_age", nsd_age));
            cmd.Parameters.Add(para.StringInputPara("@nsd_original_profile_photo", nsd_original_profile_photo));
            cmd.Parameters.Add(para.StringInputPara("@nsd_profile_photo", nsd_profile_photo));
            cmd.Parameters.Add(para.StringInputPara("@nsd_mobile_number", nsd_mobile_number));
            cmd.Parameters.Add(para.StringInputPara("@nsd_email", nsd_email));
            cmd.Parameters.Add(para.StringInputPara("@nsd_address", nsd_address));
            cmd.Parameters.Add(para.IntInputPara("@nsd_state_id", nsd_state_id));
            cmd.Parameters.Add(para.IntInputPara("@nsd_country_id", nsd_country_id));
            cmd.Parameters.Add(para.StringInputPara("@nsd_father_name", nsd_father_name));
            cmd.Parameters.Add(para.StringInputPara("@nsd_mother_name", nsd_mother_name));
            cmd.Parameters.Add(para.StringInputPara("@nsd_parent_contact_number", nsd_parent_contact_number));
            cmd.Parameters.Add(para.StringInputPara("@nsd_parent_email", nsd_parent_email));
            cmd.Parameters.Add(para.IntInputPara("@nsd_city_id", nsd_city_id));
            cmd.Parameters.Add(para.StringInputPara("@nsd_pincode", nsd_pincode));
            cmd.Parameters.Add(para.StringInputPara("@nsd_blood_group", nsd_blood_group));
            cmd.Parameters.Add(para.StringInputPara("@nsd_aadhar_card_number", nsd_aadhar_card_number));


            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable new_student_details_update(
     int nsd_id,
     int modfiy_by,
     string first_name,
     string nsd_category,
     string nsd_last_name,
     int nsd_gender,
     DateTime nsd_date_of_birth,
     int nsd_age,
     string nsd_original_profile_photo,
     string nsd_profile_photo,
     string nsd_mobile_number,
     string nsd_email,
     string nsd_address,
     int nsd_state_id,
     int nsd_country_id,
     string nsd_father_name,
     string nsd_mother_name,
     string nsd_parent_contact_number,
     string nsd_parent_email,
     int nsd_city_id,
     string nsd_pincode,
     string nsd_blood_group,
     string nsd_aadhar_card_number
 )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "new_student_details_update";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@nsd_id", nsd_id));
            cmd.Parameters.Add(para.IntInputPara("@modfiy_by", modfiy_by));
            cmd.Parameters.Add(para.StringInputPara("@first_name", first_name));
            cmd.Parameters.Add(para.StringInputPara("@nsd_category", nsd_category));
            cmd.Parameters.Add(para.StringInputPara("@nsd_last_name", nsd_last_name));
            cmd.Parameters.Add(para.IntInputPara("@nsd_gender", nsd_gender));
            cmd.Parameters.Add(para.DateInputPara("@nsd_date_of_birth", nsd_date_of_birth));
            cmd.Parameters.Add(para.IntInputPara("@nsd_age", nsd_age));
            cmd.Parameters.Add(para.StringInputPara("@nsd_original_profile_photo", nsd_original_profile_photo));
            cmd.Parameters.Add(para.StringInputPara("@nsd_profile_photo", nsd_profile_photo));
            cmd.Parameters.Add(para.StringInputPara("@nsd_mobile_number", nsd_mobile_number));
            cmd.Parameters.Add(para.StringInputPara("@nsd_email", nsd_email));
            cmd.Parameters.Add(para.StringInputPara("@nsd_address", nsd_address));
            cmd.Parameters.Add(para.IntInputPara("@nsd_state_id", nsd_state_id));
            cmd.Parameters.Add(para.IntInputPara("@nsd_country_id", nsd_country_id));
            cmd.Parameters.Add(para.StringInputPara("@nsd_father_name", nsd_father_name));
            cmd.Parameters.Add(para.StringInputPara("@nsd_mother_name", nsd_mother_name));
            cmd.Parameters.Add(para.StringInputPara("@nsd_parent_contact_number", nsd_parent_contact_number));
            cmd.Parameters.Add(para.StringInputPara("@nsd_parent_email", nsd_parent_email));
            cmd.Parameters.Add(para.IntInputPara("@nsd_city_id", nsd_city_id));
            cmd.Parameters.Add(para.StringInputPara("@nsd_pincode", nsd_pincode));
            cmd.Parameters.Add(para.StringInputPara("@nsd_blood_group", nsd_blood_group));
            cmd.Parameters.Add(para.StringInputPara("@nsd_aadhar_card_number", nsd_aadhar_card_number));


            return CreateCommand.ExecuteQuery(cmd);
        }

        public static DataTable new_student_details_select_all(
       )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "new_student_details_select_all";
            cmd.CommandType = CommandType.StoredProcedure;



            return CreateCommand.ExecuteQuery(cmd);
        }
        public static DataTable new_student_details_select_by_id(
        int id
       )
        {
            SqlCommand cmd = new SqlCommand();
            CreateParameter para = new CreateParameter();

            cmd.CommandText = "new_student_details_select_by_id";
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add(para.IntInputPara("@id", id));


            return CreateCommand.ExecuteQuery(cmd);
        }

    }
}
