using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WCSSimAPI.Controllers
{
    [Route("status")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        public static string registerQueueStatus { get; set; }
        public static string workingQueueStatus { get; set; }
        public static string doneQueueStatus { get; set; }
        public static string locationInfoQueueStatus { get; set; }

        [HttpGet("2")]
        [Produces("text/html")]
        public string GetStatus()
        {
            string responseString = @" 
            <title>WCS Status</title>
            <style type='text/css'>
            button{
                color: green;
            }
            </style>
            <h1>Job Status</h1>
            <table>
                <tr>
                    <td><b>Register Queue</b></td>
                    <td>" + registerQueueStatus + @"</td>
                    <td><a href='/log/'>Log</a></td>
                </tr>
                <tr>
                    <td>Working Queue</td>
                    <td>" + workingQueueStatus + @"</td>
                    <td>Log</td>
                </tr>
                <tr>
                    <td>Done Queue</td>
                    <td>" + doneQueueStatus + @"</td>
                    <td>Log</td>
                </tr>
                <tr>
                    <td>Location Info Queue</td>
                    <td>" + locationInfoQueueStatus + @"</td>
                    <td>Log</td>
                </tr>
            </table>
            ";
            return responseString;

        }

        [HttpGet]
        public string GetStatus2()
        {
            string responseString = @"
                Register Queue => " + registerQueueStatus + @"
                Working Queue => " + workingQueueStatus + @"
                Done Queue => " + doneQueueStatus + @"
                Location Info Queue => " + locationInfoQueueStatus + @"
                DBConnection => " + ConstConfig.DBConnection + @"
                CronEx => " + ConstConfig.CronEx + @"
                WMSApiURL => " + ConstConfig.WMSApiURL;
            return responseString;

        }
    }
}