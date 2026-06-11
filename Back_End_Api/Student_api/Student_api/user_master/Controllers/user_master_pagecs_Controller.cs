using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Student_api.Student_Information.Controllers;
using Student_api.Student_Information.Models;
using Student_api.user_master;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net;
using System.Net.Mail;
using static Student_api.user_master.Controllers.CommonResponse;
using static System.Net.WebRequestMethods;

namespace Student_api.user_master.Controllers
{
    public class CommonResponse
    {
        public int Status { get; set; }
        public string Message { get; set; }
        public object Result { get; set; }

        public class usermasterInformationModel
        {

            public int um_id { get; set; }
            public int modifiy_By { get; set; }
            public int create_By { get; set; }
            public string um_user_name { get; set; }
            public string um_email_id { get; set; }
            public string um_password { get; set; }
            public int login_id { get; set; }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class user_master_pagecs_Controller : ControllerBase
    {
        [HttpPost]
        [Route("user_master_insert_user")]
        public IActionResult Insert([FromForm] usermasterInformationModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.user_master_insert_user(
                    model.create_By,
                    model.um_user_name,
                    model.um_email_id,
                    model.um_password,
                    model.login_id
                );

                if (dt != null && dt.Rows.Count > 0)
                {
                    cd.Status = Convert.ToInt32(dt.Rows[0]["Status"]);
                    cd.Message = dt.Rows[0]["Message"].ToString();
                    cd.Result = dt;
                }
                else
                {
                    cd.Status = 0;
                    cd.Message = "Something went wrong.";
                    cd.Result = null;
                }
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = ex.Message;
                cd.Result = null;
            }

            return Content(JsonConvert.SerializeObject(cd), "application/json");
        }
        [HttpPost]
        [Route("user_master_update")]
        public IActionResult update([FromForm] usermasterInformationModel model)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.user_master_update(
                    model.um_id,
                    model.modifiy_By,
                    model.um_user_name,
                    model.um_email_id,
                    model.um_password,
                    model.login_id
                );

                if (dt != null && dt.Rows.Count > 0)
                {
                    cd.Status = Convert.ToInt32(dt.Rows[0]["Status"]);
                    cd.Message = dt.Rows[0]["Message"].ToString();
                    cd.Result = dt;
                }
                else
                {
                    cd.Status = 0;
                    cd.Message = "Something went wrong.";
                    cd.Result = null;
                }
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = ex.Message;
                cd.Result = null;
            }

            return Content(JsonConvert.SerializeObject(cd), "application/json");
        }

        [HttpGet]
        [Route("user_master_log_rightes")]
        public string user_master_log_rightes(string um_email_id, string um_password)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.user_master_log_rightes(um_email_id, um_password);
                cd.Status = 1;
                cd.Message = "Data Inserted Successfully";
                cd.Result = dt;
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }


            return JsonConvert.SerializeObject(cd);
        }

        [HttpGet]
        [Route("user_master_select_by_id")]
        public string user_master_select_by_id(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.user_master_select_by_id(id);
                cd.Status = 1;
                cd.Message = "Data Inserted Successfully";
                cd.Result = dt;
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }


            return JsonConvert.SerializeObject(cd);
        }

        [HttpGet]
        [Route("user_master_delete")]
        public string user_master_delete(int id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.user_master_delete(id);
                cd.Status = 1;
                cd.Message = "Data Delete Successfully";
                cd.Result = dt;
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }


            return JsonConvert.SerializeObject(cd);
        }

        [HttpPost]
        [Route("forgot_password_update")]
        public string forgot_password_update(string username, int otp, string new_password)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.forgot_password_update(username, otp, new_password);
                cd.Status = 1;
                cd.Message = "Data Update Successfully";
                cd.Result = dt;
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }


            return JsonConvert.SerializeObject(cd);
        }

        [HttpPost]
        [Route("SendOTP")]
        public string SendOTP(string email_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.SendOTP(email_id);

                if (dt.Rows.Count > 0)
                {
                    string status = dt.Rows[0]["Status"].ToString();
                    string message = dt.Rows[0]["Message"].ToString();
                    string otp = dt.Rows[0]["OTP"]?.ToString();

                    if (status == "-1")
                    {
                        cd.Status = -1;
                        cd.Message = message;
                        cd.Result = null;
                        return JsonConvert.SerializeObject(cd);
                    }

                    if (status == "1")
                    {
                        // send email only if OTP exists
                        if (!string.IsNullOrEmpty(otp))
                        {
                            BAL_user_master_pagecs.SendEmail(email_id, otp);
                        }

                        cd.Status = 1;
                        cd.Message = message;
                        cd.Result = null;
                    }
                }
                else
                {
                    cd.Status = 0;
                    cd.Message = "No response from server";
                    cd.Result = null;
                }
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }

            return JsonConvert.SerializeObject(cd);
        }

        [HttpPost]
        [Route("SendOTP_new_user")]
        public string SendOTP_new_user(string email_id)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.SendOTP_new_user(email_id);

                if (dt != null && dt.Rows.Count > 0)
                {
                    string message = dt.Rows[0]["Message"]?.ToString();
                    string otp = dt.Rows[0]["OTP"]?.ToString();

                    // Send Email
                    if (!string.IsNullOrEmpty(otp))
                    {
                        BAL_user_master_pagecs.SendEmail_new_user(email_id, otp);
                    }

                    cd.Status = 1;
                    cd.Message = message;
                    cd.Result = null;
                }
                else
                {
                    cd.Status = 0;
                    cd.Message = "No response from server";
                    cd.Result = null;
                }
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }

            return JsonConvert.SerializeObject(cd);
        }

        [HttpGet]
        [Route("VerifyOTP")]
        public string VerifyOTP(string email_id, string otp)
        {
            CommonResponse cd = new CommonResponse();

            try
            {
                DataTable dt = BAL_user_master_pagecs.VerifyOTP(email_id, otp);
                cd.Status = 1;
                cd.Message = "OTP validation check completed";
                cd.Result = dt;
            }
            catch (Exception ex)
            {
                cd.Status = 0;
                cd.Message = "Error: " + ex.Message;
                cd.Result = null;
            }

            return JsonConvert.SerializeObject(cd);
        }

    }
}

