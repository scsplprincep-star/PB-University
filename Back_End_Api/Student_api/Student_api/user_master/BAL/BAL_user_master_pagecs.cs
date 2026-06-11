using Microsoft.Data.SqlClient;
using Student_api.DAL;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net;
using System.Net.Mail;
public class BAL_user_master_pagecs
{

    public static DataTable user_master_insert_user(
        int create_By,
        string um_user_name,
        string um_email_id,
        string um_password,
        int login_id
    )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "user_master_insert_user";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.IntInputPara("@create_By", create_By));
        cmd.Parameters.Add(para.StringInputPara("@um_user_name", um_user_name));
        cmd.Parameters.Add(para.StringInputPara("@um_email_id", um_email_id));
        cmd.Parameters.Add(para.StringInputPara("@um_password", um_password));
        cmd.Parameters.Add(para.IntInputPara("@login_id", login_id));

        return CreateCommand.ExecuteQuery(cmd);
    }
    public static DataTable user_master_update(
        int um_id,
        int modifiy_By,
        string um_user_name,
        string um_email_id,
        string um_password,
        int login_id
    )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "user_master_update";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.IntInputPara("@um_id", um_id));
        cmd.Parameters.Add(para.IntInputPara("@modifiy_By", modifiy_By));
        cmd.Parameters.Add(para.StringInputPara("@um_user_name", um_user_name));
        cmd.Parameters.Add(para.StringInputPara("@um_email_id", um_email_id));
        cmd.Parameters.Add(para.StringInputPara("@um_password", um_password));
        cmd.Parameters.Add(para.IntInputPara("@login_id", login_id));

        return CreateCommand.ExecuteQuery(cmd);
    }

    public static DataTable user_master_log_rightes(
         string um_email_id,
         string um_password
     )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "user_master_log_rightes";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.StringInputPara("@um_email_id", um_email_id));
        cmd.Parameters.Add(para.StringInputPara("@um_password", um_password));

        return CreateCommand.ExecuteQuery(cmd);
    }
    public static DataTable user_master_select_by_id(
         int id
     )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "user_master_select_by_id";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.IntInputPara("@id", id));

        return CreateCommand.ExecuteQuery(cmd);
    }
    public static DataTable user_master_delete(
         int id
     )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "user_master_delete";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.IntInputPara("@id", id));

        return CreateCommand.ExecuteQuery(cmd);
    }

    public static DataTable forgot_password_update(
         string username,
         int otp,
         string new_password
     )
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "forgot_password_update";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.StringInputPara("@username", username));
        cmd.Parameters.Add(para.IntInputPara("@otp", otp));
        cmd.Parameters.Add(para.StringInputPara("@new_password", new_password));

        return CreateCommand.ExecuteQuery(cmd);
    }

    public static DataTable SendOTP(string email_id)
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "sp_SendOTP";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.StringInputPara("@email_id", email_id));

        DataTable dt = CreateCommand.ExecuteQuery(cmd);

        return dt;
    }
    public static void SendEmail(string toEmail, string otp)
    {
        try
        {
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress("scspl.princep@gmail.com");
            mail.To.Add(toEmail);
            mail.Subject = "Your OTP Code";

            mail.IsBodyHtml = true;

            mail.Body = $@"
        <div style='font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;'>
            <div style='max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px; text-align:center;'>
                
                <h2 style='color:#333;'>OTP Verification</h2>
                
                <p style='font-size:16px; color:#555;'>
                    Use the following OTP to complete your verification process:
                </p>
                
                <div style='font-size:30px; font-weight:bold; color:#2c3e50; margin:20px 0;'>
                    {otp}
                </div>
                
                <p style='color:#888; font-size:14px;'>
                    This OTP is valid for <b>5 minutes</b>.
                </p>
                
                <hr style='margin:20px 0;' />
                
                <p style='font-size:12px; color:#aaa;'>
                    If you did not request this, please ignore this email.
                </p>
            </div>
        </div>";

            SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587);
            smtp.UseDefaultCredentials = false;

            smtp.Credentials = new NetworkCredential(
                "scspl.princep@gmail.com",
                "qbvtaozrgcpxszue"
            );

            smtp.EnableSsl = true;

            smtp.Send(mail);
        }
        catch (Exception ex)
        {
            throw new Exception("Email sending failed: " + ex.Message);
        }
    }


    public static DataTable VerifyOTP(string email_id, string otp)
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "sp_VerifyOTP";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.StringInputPara("@email_id", email_id));
        cmd.Parameters.Add(para.StringInputPara("@otp", otp));  

        return CreateCommand.ExecuteQuery(cmd);
    }
    public static DataTable SendOTP_new_user(string email_id)
    {
        SqlCommand cmd = new SqlCommand();
        CreateParameter para = new CreateParameter();

        cmd.CommandText = "SendOTP_new_create_user";
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.Add(para.StringInputPara("@email_id", email_id));

        DataTable dt = CreateCommand.ExecuteQuery(cmd);

        return dt;
    }
    public static void SendEmail_new_user(string toEmail, string otp)
    {
        try
        {
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress("scspl.princep@gmail.com");
            mail.To.Add(toEmail);
            mail.Subject = "Your OTP Code";

            mail.IsBodyHtml = true;

            mail.Body = $@"
        <div style='font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;'>
            <div style='max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px; text-align:center;'>
                
                <h2 style='color:#333;'>OTP Verification</h2>
                
                <p style='font-size:16px; color:#555;'>
                    Use the following OTP to complete your verification process:
                </p>
                
                <div style='font-size:30px; font-weight:bold; color:#2c3e50; margin:20px 0;'>
                    {otp}
                </div>
                
                <p style='color:#888; font-size:14px;'>
                    This OTP is valid for <b>5 minutes</b>.
                </p>
                
                <hr style='margin:20px 0;' />
                
                <p style='font-size:12px; color:#aaa;'>
                    If you did not request this, please ignore this email.
                </p>
            </div>
        </div>";

            SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587);
            smtp.UseDefaultCredentials = false;

            smtp.Credentials = new NetworkCredential(
                "scspl.princep@gmail.com",
                "qbvtaozrgcpxszue"
            );

            smtp.EnableSsl = true;

            smtp.Send(mail);
        }
        catch (Exception ex)
        {
            throw new Exception("Email sending failed: " + ex.Message);
        }
    }
}

