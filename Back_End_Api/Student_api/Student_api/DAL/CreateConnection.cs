using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;

 

    public class CreateConnection
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public CreateConnection(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("Connection");
        }

        // ✅ Return new SQL connection
        public SqlConnection GetConnection()
        {
            try
            {
                SqlConnection con = new SqlConnection(_connectionString);
                return con;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while creating SQL Connection: " + ex.Message);
            }
        }

        // ✅ Open connection safely
        public void OpenConnection(SqlConnection con)
        {
            if (con.State == System.Data.ConnectionState.Closed)
                con.Open();
        }

        // ✅ Close connection safely
        public void CloseConnection(SqlConnection con)
        {
            if (con.State == System.Data.ConnectionState.Open)
                con.Close();
        }
    }

