using System;
using System.Collections.Generic;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Exception;

namespace AMWUtil.DataAccess
{
    public static class LocalFileAccess
    {
        public static FileInfo[] GetFileList(string path, string extension)
        {
            try
            {
                return new DirectoryInfo(path).GetFiles($"*.{extension}");
            }
            catch
            {
                return null;
            }
        }

        public static string ReadFile(FileInfo file)
        {
            return File.ReadAllText(file.FullName);
        }

        public static void MoveFile(FileInfo file, string desPath, string errorPath)
        {
            try
            {
                if (!Directory.Exists(desPath))
                    Directory.CreateDirectory(desPath);
                if (!File.Exists($"{desPath}/{file.Name}"))
                {
                    file.MoveTo($"{desPath}/{file.Name}");
                }
            }
            catch
            {
                if (!string.IsNullOrWhiteSpace(errorPath))
                {
                    if (!Directory.Exists(errorPath))
                        Directory.CreateDirectory(errorPath);
                    if (!File.Exists($"{desPath}/{file.Name}"))
                    {
                        file.Replace($"{desPath}/{file.Name}", null);
                    }
                }
            }
        }

        public static void CreateTextFile(string path, string body, string fileName)
        {
            try
            {
                if (!Directory.Exists($"{path}/{fileName}"))
                {
                    File.WriteAllText($"{path}/{fileName}", body);
                }
                else
                {
                    throw new System.Exception($"มีไฟล์ {fileName} ในระบบแล้ว");
                }
            }
            catch(System.Exception ex)
            {
                throw new System.Exception(ex.ToString());
            }
            
        }
    }
}
