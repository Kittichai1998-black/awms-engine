using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebTest.Controllers
{
    [Route("status")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        public static string registerQueueStatus { get; set; }
        public static string workingQueueStatus { get; set; }
        public static string doneQueueStatus { get; set; }
        public static string locationInfoQueueStatus { get; set; }

        [HttpGet]
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
    }
}