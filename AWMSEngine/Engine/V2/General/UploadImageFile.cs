using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Reflection;
using AMWUtil.Common;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class UploadImageFile : BaseEngine<UploadImageFile.TReq, UploadImageFile.TRes>
    {
     
        public class TReq
        {
            public string baseCode;
            public string imageBase64;
        }
        public class TRes
        {
            public string fileName;
        }
        protected override UploadImageFile.TRes ExecuteEngine(TReq reqVO)
        {
            string[] strings = reqVO.imageBase64.Split(",");

            byte[] bytes = Convert.FromBase64String(strings[1]);

            string extension;
            switch (strings[0])
            {//check image's extension
                case "data:image/jpeg;base64":
                    extension = "jpeg";
                    break;
                case "data:image/png;base64":
                    extension = "png";
                    break;
                default://should write cases for more images types
                    extension = "jpg";
                    break;
            }
            
            var filepath = StaticValue.GetConfigValue(ConfigCode.PATH_FOLDER_IMAGES);
            CreateFolder(filepath);
            DeleteOldFile(filepath, reqVO.baseCode);

            var fileName = reqVO.baseCode + "." + extension;
            var fileFullPath = filepath + "/" + fileName;

            //if (File.Exists(fileFullPath))
            //{
            //    File.Delete(fileFullPath);
            //}
            Image image;
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                 
                image = Image.FromStream(ms);

                image.Save(fileFullPath, ParseImageFormat(extension));
            }
            var res = new TRes() {
                fileName = fileName
            };
            return res;
        }
        private ImageFormat ParseImageFormat(string str)
        {
            return (ImageFormat)typeof(ImageFormat)
                    .GetProperty(str, BindingFlags.Public | BindingFlags.Static | BindingFlags.IgnoreCase)
                    .GetValue(str, null);
        }
        private void CreateFolder(string filePath)
        {
            // Specify the directory you want to manipulate.
            //string path = @filePath;

            try
            {
                // Determine whether the directory exists.
                if (Directory.Exists(filePath))
                {
                    return;
                }

                // Try to create the directory.
                DirectoryInfo di = Directory.CreateDirectory(filePath);

                //// Delete the directory.
                //di.Delete();
                //Console.WriteLine("The directory was deleted successfully.");
            }
            catch (Exception e)
            { 
                throw new AMWException(this.Logger, AMWExceptionCode.S0001, "The process failed: " + e.ToString());
            }
            finally { }
        }

        private void DeleteOldFile(string filePath, string fileName)
        {
            DirectoryInfo diInfo = new DirectoryInfo(filePath);
            FileInfo[] files = diInfo.GetFiles();
            for (int i = 0; i < files.Length; i++)
            {
                var name = files[i].Name.Split(".");
                if (fileName == name[0])
                {
                    string _filePath = files[i].ToString();
                    if (File.Exists(_filePath))
                    {
                        File.Delete(_filePath);
                    }
                }
              
            }
        }
    }
}
