using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Student_api.DAL;
using System;
using Microsoft.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;

public class OtpCleanupService : BackgroundService
{
    private readonly IConfiguration _config;

    public OtpCleanupService(IConfiguration config)
    {
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                Console.WriteLine("OTP Cleanup Running: " + DateTime.Now);

                using (SqlConnection con = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
                {
                    await con.OpenAsync();

                    SqlCommand cmd = new SqlCommand(
                        "DELETE FROM OTP_Verification WHERE ExpiryTime <= GETDATE()", con);

                    int rows = await cmd.ExecuteNonQueryAsync();

                    Console.WriteLine("Deleted Rows: " + rows);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

}