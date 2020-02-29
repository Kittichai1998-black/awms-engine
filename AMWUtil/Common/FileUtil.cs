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
        public static Stream findstr(string path,string search)
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

            return p.StandardOutput.BaseStream;

        }

        public static Stream findstr2(string path, string search)
        {
            string fileName = path.Split(new char[] { '\\', '/' }).Last();
            string fileNameTmp = search + '.' + DateTime.Now.Ticks.ToString();
            string dirName = path.Substring(0, path.Length - fileName.Length);

            using (StreamWriter sw = new StreamWriter(dirName + fileNameTmp, false, Encoding.UTF8))
            {
                foreach (string readFileName in Directory.GetFiles(dirName, fileName))
                {
                    using (StreamReader sr = new StreamReader(readFileName))
                    {
                        while (sr.EndOfStream)
                        {
                            string txt = sr.ReadLine();
                            if (Regex.IsMatch(txt, search))
                                sw.WriteLine(txt);
                        }
                    }
                }
            }

            var res = new FileStream(fileNameTmp, FileMode.Open, FileAccess.Read, FileShare.None, 4096, FileOptions.DeleteOnClose);
            return res;
        }
    }
}
