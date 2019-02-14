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
        public static string locationMoveQueueStatus { get; set; }
        public static List<string> errorListsRegister = new List<string>();
        public static List<string> errorListsWorking = new List<string>();
        public static List<string> errorListsDone = new List<string>();
        public static List<string> errorListsLocInfo = new List<string>();
        public static List<string> errorListsLocMove = new List<string>();

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
        public string GetStatus2(string log)
        {

            string responseString = @"
                Register Queue => " + registerQueueStatus + @"
                Working Queue => " + workingQueueStatus + @"
                Done Queue => " + doneQueueStatus + @"
                Location Info Queue => " + locationInfoQueueStatus;
            int c = 0;

            if (string.IsNullOrWhiteSpace(log) || log.ToUpper() == "REGISTER")
                responseString += "\n\n#######LOG REGISTER############\n" + string.Join("\n", errorListsRegister.Select(x => (++c).ToString("000") + ">" + x).ToArray());

            if (string.IsNullOrWhiteSpace(log) || log.ToUpper() == "WORKING")
                responseString += "\n\n#######LOG WORKING############\n" + string.Join("\n", errorListsWorking.Select(x => (++c).ToString("000") + ">" + x).ToArray());

            if (string.IsNullOrWhiteSpace(log) || log.ToUpper() == "DONE")
                responseString += "\n\n#######LOG DONE############\n" + string.Join("\n", errorListsDone.Select(x => (++c).ToString("000") + ">" + x).ToArray());

            if (string.IsNullOrWhiteSpace(log) || log.ToUpper() == "LOCATIONINFO")
                responseString += "\n\n#######LOG LOCATIONINFO############\n" + string.Join("\n", errorListsLocInfo.Select(x => (++c).ToString("000") + ">" + x).ToArray());

            if (string.IsNullOrWhiteSpace(log) || log.ToUpper() == "LOCATIONMOVE")
                responseString += "\n\n#######LOG LOCATIONMOVE############\n" + string.Join("\n", errorListsLocMove.Select(x => (++c).ToString("000") + ">" + x).ToArray());

            return responseString;

        }
    }
}