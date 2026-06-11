using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System;
using System.IO;
using System.Linq;

namespace Student_api.TestDataConnection.BAL
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestConnectionController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public TestConnectionController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                // ===============================
                // 1️⃣ Check if appsettings.json exists
                // ===============================
                string jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
                if (!System.IO.File.Exists(jsonPath))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "❌ Configuration file 'appsettings.json' not found.",
                        filePath = jsonPath
                    });
                }

                // ===============================
                // 2️⃣ Debug: Print all configuration keys
                // ===============================
                var allConfig = _configuration.AsEnumerable().ToList();
                Console.WriteLine("===== All Configuration Keys =====");
                foreach (var kv in allConfig)
                {
                    Console.WriteLine($"{kv.Key} = {kv.Value}");
                }

                // ===============================
                // 3️⃣ Read connection string
                // ===============================
                string connectionString = _configuration.GetConnectionString("Connection");

                // Fallback if null
                if (string.IsNullOrEmpty(connectionString))
                {
                    connectionString = _configuration["ConnectionStrings:Connection"];
                }

                if (string.IsNullOrEmpty(connectionString))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "❌ Connection string is missing or empty in appsettings.json."
                    });
                }

                Console.WriteLine($" Connection string found: {connectionString}");

                // ===============================
                // 4️⃣ Test SQL Connection
                // ===============================
                using (SqlConnection con = new SqlConnection(connectionString))
                {
                    con.Open();
                    return Ok(new
                    {
                        success = true,
                        message = " Database connection successful!",
                        server = con.DataSource,
                        database = con.Database
                    });
                }
            }
            catch (SqlException sqlEx)
            {
                return BadRequest(new
                {
                    success = false,
                    message = " Database connection failed!",
                    error = sqlEx.Message,
                    errorNumber = sqlEx.Number
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = " Unexpected error occurred!",
                    error = ex.Message
                });
            }
        }
    }
}
