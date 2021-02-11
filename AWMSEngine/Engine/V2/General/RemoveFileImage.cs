using System;
using System.Collections.Generic;
using AMSModel.Criteria;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using AMSModel.Constant.EnumConst;

namespace AWMSEngine.Engine.V2.General
{
    public class RemoveFileImage : BaseEngine<RemoveFileImage.TReq, NullCriteria>
    {
        public class TReq
        {
            public string fileName;

        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            
            var filepath = StaticValue.GetConfigValue(ConfigCommon.PATH_FOLDER_IMAGES);

            DeleteOldFile(filepath, reqVO.fileName);

            return null;
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
