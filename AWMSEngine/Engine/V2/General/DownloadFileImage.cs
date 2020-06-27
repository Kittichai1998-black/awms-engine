using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class DownloadFileImage : BaseEngine<DownloadFileImage.TReq, DownloadFileImage.TRes>
    {
        public class TReq
        {
            public string fileName;
        }
        public class TRes
        {
            public Stream stream;
            public string contentType;
            public string fileName;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var filepath = StaticValue.GetConfigValue(ConfigCode.PATH_FOLDER_IMAGES);
            string[] filePaths = Directory.GetFiles(@filepath.ToString());

            var resFile = Array.Find(filePaths, s => s.Contains(reqVO.fileName));
            string extension;
            extension = Path.GetExtension(resFile).Replace(".", ""); 
            string fileName = Path.GetFileName(resFile);

            StreamReader s = new StreamReader(resFile);

            res.stream = s.BaseStream;
            res.contentType = "image/"+ extension;
            res.fileName = fileName;
            return res;
        }
        private  byte[] ReadFile(string filePath)
        {
            byte[] buffer;
            FileStream fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            try
            {
                int length = (int)fileStream.Length;  // get file length
                buffer = new byte[length];            // create buffer
                int count;                            // actual number of bytes read
                int sum = 0;                          // total number of bytes read

                // read until Read method returns 0 (end of the stream has been reached)
                while ((count = fileStream.Read(buffer, sum, length - sum)) > 0)
                    sum += count;  // sum is a buffer offset for next reading
            }
            finally
            {
                fileStream.Close();
            }
            return buffer;
        }
    }
}
