using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace AMWUtil.DataAccess
{
    public static class APIFileAccess
    {
        public static TResponse WriteLocalSync<TResponse>(
            AMWLogger logger, string partIn, string partOut, string filename, object request, int timeout = 15000)
        {
            partIn = Regex.Replace(partIn, "[\\/]$", "") + "/";
            partOut = Regex.Replace(partOut, "[\\/]$", "") + "/";
            if (!Directory.Exists(partIn))
                Directory.CreateDirectory(partIn);

            string partOutArc = partOut + "archive/" + DateTime.Now.ToString("yyyyMMdd") + "/";
            if (!Directory.Exists(partOutArc))
                Directory.CreateDirectory(partOutArc);

            string fullFileIn = partIn + filename + ".json";
            string fullFileOut = partOut + filename + ".json";

            StreamWriter sw = new StreamWriter(fullFileIn, false, Encoding.UTF8);
            string txt_json = request.Json();
            sw.Write(txt_json);
            sw.Flush();
            sw.Close();
            if (logger != null) logger.LogInfo("[WRITE_API_Sync] file = " + fullFileIn);
            if (logger != null) logger.LogInfo("[WRITE_API_Sync] text = " + txt_json);
            while (!File.Exists(fullFileOut))
            {
                if (timeout <= 0)
                    throw new AMWException(logger, AMWExceptionCode.S0_API_TIMEOUT);
                timeout -= 300;
                Thread.Sleep(300);
            }

            StreamReader sr = new StreamReader(fullFileOut);
            txt_json = sr.ReadToEnd();
            sr.Close();
            if (logger != null) logger.LogInfo("[READ_API_Sync] file = " + fullFileOut);
            if (logger != null) logger.LogInfo("[READ_API_Sync] text = " + txt_json);
            var res = txt_json.Json<TResponse>();

            File.Move(fullFileOut, partOutArc + filename + ".json");
            if (logger != null) logger.LogInfo("[MOVE_API_Sync] file = " + partOutArc + filename + ".json");

            return res;
        }

        public static void WriteLocalAsync(
            AMWLogger logger, string partIn, string filename, object request)
        {
            partIn = Regex.Replace(partIn, "[\\/]$", "") + "/";
            if (!Directory.Exists(partIn))
                Directory.CreateDirectory(partIn);

            string fullFileIn = partIn + filename + ".json";

            StreamWriter sw = new StreamWriter(fullFileIn, false, Encoding.UTF8);
            string txt_json = request.Json();
            sw.Write(txt_json);
            sw.Flush();
            sw.Close();
            if (logger != null) logger.LogInfo("[WRITE_API_Async] file = " + fullFileIn);
            if (logger != null) logger.LogInfo("[WRITE_API_Async] text = " + txt_json);
            
        }
    }
}
