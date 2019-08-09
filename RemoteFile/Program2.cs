using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;

namespace RemoteFile
{
    class Program2
    {
        static void Main(string[] args)
        {
            if (!Directory.Exists(Directory.GetCurrentDirectory() + "/logs"))
                Directory.CreateDirectory(Directory.GetCurrentDirectory() + "/logs");
            log("START", "###################################");
            int count_try = 0;
            while (true)
            {
                try
                {
                    log("BEGIN", "try!::" + count_try);
                    count_try++;

                    string from_dir = string.Empty;
                    string from_dir_archive2 = string.Empty;
                    string to_dir = string.Empty;
                    using (StreamReader app = new StreamReader("app.property"))
                    {
                        while (!app.EndOfStream)
                        {
                            string s = app.ReadLine();
                            if (string.IsNullOrWhiteSpace(s) && s.StartsWith("#"))
                                continue;
                            string[] v = s.Split('=');
                            if (v.Length != 2)
                                continue;
                            string v0 = v[0].Trim().ToLower();
                            string v1 = v[1].Trim();
                            if (v0.Equals("from_dir"))
                                from_dir = v1;
                            else if (v0.Equals("to_dir"))
                                to_dir = v1;
                        }
                        if (!to_dir.EndsWith("/") && !to_dir.EndsWith("\\"))
                            to_dir += "/";
                        if (!from_dir.EndsWith("/") && !from_dir.EndsWith("\\"))
                            from_dir += "/";
                        
                    }

                    from_dir_archive2 = from_dir + "archive2/" + DateTime.Now.ToString("yyyyMMdd") + "/";
                    if (!Directory.Exists(to_dir))
                        Directory.CreateDirectory(to_dir);
                    if (!Directory.Exists(from_dir_archive2))
                        Directory.CreateDirectory(from_dir_archive2);
                    
                    while (true)
                    {
                        log("INFO", "-------------ACTIVE-------------");

                        log("DEBUG", "GET FILES DIR::" + from_dir);
                        string[] files = Directory.GetFiles(from_dir, "*.xml");
                        log("DEBUG", "GET FILES COUNT::" + from_dir.Length);

                        foreach (string f in files)
                        {
                            int last_index = f.LastIndexOf('/');
                            if (last_index < 0)
                                last_index = f.LastIndexOf('\\');

                            string _f = f.Substring(last_index + 1);

                            try
                            {
                                log("INFO", "MOVE::" + f + " " + to_dir + _f);
                                File.Copy(f, to_dir + _f);
                            }
                            catch
                            {
                                _f = DateTime.Now.ToString("HHmmss") + "." + _f;
                                log("INFO", "CHANGE MOVE::" + f + " " + to_dir + _f);
                                File.Copy(f, to_dir + _f);
                            }
                            log("INFO", "ARCHIVE2 MOVE::" + f + " " + from_dir_archive2 + _f);
                            File.Move(f, from_dir_archive2 + _f);
                        }

                        log("INFO", "!!SLEEP!!");
                        Thread.Sleep(5000);
                    };

                }
                catch (Exception ex)
                {
                    log("ERROR", ex.Message);
                }
                finally
                {
                    log("END", "finally!");
                }

                Thread.Sleep(10000);
            }
        }

        static void log(string tag ,string msg)
        {
            string m = DateTime.Now.ToString("HH:mm:ss") + " [" + tag + "] " + msg;
            Console.WriteLine(m);
            if (tag != "DEBUG")
            {
                using (StreamWriter sw = new StreamWriter(Directory.GetCurrentDirectory() + "/logs/" + DateTime.Now.ToString("yyyyMMdd") + ".log", true))
                {
                    sw.WriteLine(m);
                }
            }
        }
    }
}
