using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace AMWUtil.Common
{
    public static class FileUtil
    {
        public static StreamReader findstr(string path,string search)
        {
            string quote = "\"";
            string fileName = path.Split(new char[] { '\\', '/' }).Last();
            string cd = path.Substring(0, path.Length- fileName.Length);
            Process p = new Process();
            p.StartInfo = new ProcessStartInfo("findstr.exe");
            p.StartInfo.Arguments = quote + search + quote + " " + quote + fileName + quote;
            p.StartInfo.WorkingDirectory = cd;
            p.StartInfo.ErrorDialog = true;
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.RedirectStandardOutput = true;

            p.Start();

            p.WaitForExit();

            //string sTest = p.StandardOutput.ReadToEnd();

            return p.StandardOutput;

        }
    }
}
