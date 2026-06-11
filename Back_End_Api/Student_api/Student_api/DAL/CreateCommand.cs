using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.IO;


    public class CreateCommand
    {
        // ✅ Read connection string from appsettings.json
        private static string GetConnectionString()
        {
            IConfiguration config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            // Match your key in appsettings.json -> "ConnectionStrings": { "Connection": "..." }
            return config.GetConnectionString("Connection");
        }

        // ✅ Create command object
        public SqlCommand Create(SqlConnection con, string queryOrSP, CommandType commandType)
        {
            SqlCommand cmd = new SqlCommand(queryOrSP, con);
            cmd.CommandType = commandType;
            return cmd;
        }

        // ✅ Execute INSERT/UPDATE/DELETE
        public int ExecuteNonQuery(SqlCommand cmd)
        {
            try
            {
                return cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                throw new Exception("Error while executing NonQuery: " + ex.Message);
            }
        }

        // ✅ Static NonExecuteQuery (for BAL delete/update/insert)
        public static int NonExecuteQuery(SqlCommand cmd)
        {
            try
            {
                // ❌ FIXED: You were missing parentheses on GetConnectionString()
                using (SqlConnection con = new SqlConnection(GetConnectionString()))
                {
                    cmd.Connection = con;
                    cmd.CommandType = CommandType.StoredProcedure;
                    con.Open();
                    return cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error while executing NonExecuteQuery: " + ex.Message);
            }
        }

        // ✅ Execute SELECT (return DataTable)
        public DataTable ExecuteReader(SqlCommand cmd)
        {
            DataTable dt = new DataTable();
            try
            {
                using (SqlDataReader dr = cmd.ExecuteReader())
                {
                    dt.Load(dr);
                }
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while executing Reader: " + ex.Message);
            }
        }

        // ✅ Execute single scalar value
        public object ExecuteScalar(SqlCommand cmd)
        {
            try
            {
                return cmd.ExecuteScalar();
            }
            catch (Exception ex)
            {
                throw new Exception("Error while executing Scalar: " + ex.Message);
            }
        }

        // ✅ ExecuteQuery — static helper for SELECT stored procedures
        public static DataTable ExecuteQuery(SqlCommand cmd)
        {
            try
            {
                string connectionString = GetConnectionString();
                using (SqlConnection con = new SqlConnection(connectionString))
                {
                    cmd.Connection = con;
                    cmd.CommandType = CommandType.StoredProcedure;
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    return dt;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error while executing ExecuteQuery: " + ex.Message);
            }
        }
    }

