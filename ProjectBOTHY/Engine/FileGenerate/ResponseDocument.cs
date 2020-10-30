using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using ProjectBOTHY.Model;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using System.Text;
using ADO.WMSStaticValue;
using AMWUtil.DataAccess;

namespace ProjectBOTHY.Engine.FileGenerate
{
    public class ResponseDocument : AWMSEngine.Engine.BaseEngine<amt_Document, ResponseDocument.ResponseFormat>
    {
        public class ResponseFormat
        {
            public FileFormat.TextFileHeader header;
            public List<ResponseDetail> details = new List<ResponseDetail>();
            public FileFormat.TextFileHeader footer;

            public class ResponseDetail
            {
                public string skuType;
                public string baseType;
                public string baseCode;
                public decimal? quantity;
            }
        }

        protected override ResponseFormat ExecuteEngine(amt_Document reqVO)
        {
            var _res = new ResponseFormat();
            var fileName = "";
            var command = "";
            var commandNo = command == "CYCLECOUNT" ? DateTime.Now.ToString("yyyyMMdd hhMMss") : reqVO.Ref1;

            switch (reqVO.DocumentType_ID)
            {
                case DocumentTypeID.PUTAWAY:
                    {
                        if (reqVO.Status == EntityStatus.REMOVE)
                        {
                            fileName = $"RES_CANCEL_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                            command = "CANCELSTOREIN";
                        }
                        else
                            command = "STOREIN";
                        break;
                    }
                case DocumentTypeID.PICKING:
                    {
                        if (reqVO.Status == EntityStatus.REMOVE)
                        {
                            fileName = $"RES_CANCEL_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                            command = "CANCELSTOREOUT";
                        }
                        else
                            command = "STOREOUT";
                        break;
                    }
                case DocumentTypeID.PHYSICAL_COUNT:
                    {
                        command = "CYCLECOUNT";
                        break;
                    }
                case DocumentTypeID.AUDIT:
                    {
                        if (reqVO.Status == EntityStatus.REMOVE)
                        {
                            fileName = $"RES_CANCEL_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                            command = "CANCELTRANSFER";
                        }
                        else
                            command = "TRANSFER";
                        break;
                    }
            }

            _res.header = new FileFormat.TextFileHeader()
            {
                prefix = "START",
                command = command,
                commandNo = commandNo
            };

            var details = reqVO.DocumentItems.Select(x =>
            {
                if (command != "STOREOUT" && command != "CANCELSTOREOUT")
                {
                    return new ResponseFormat.ResponseDetail()
                    {
                        skuType = ObjectUtil.QryStrGetValue(x.Options, "skuType"),
                        baseType = ObjectUtil.QryStrGetValue(x.Options, "baseType"),
                        baseCode = ObjectUtil.QryStrGetValue(x.Options, "baseCode")
                    };
                }
                else
                {
                    return new ResponseFormat.ResponseDetail()
                    {
                        skuType = ObjectUtil.QryStrGetValue(x.Options, "skuType"),
                        baseType = ObjectUtil.QryStrGetValue(x.Options, "baseType"),
                        baseCode = ObjectUtil.QryStrGetValue(x.Options, "baseCode"),
                        quantity = string.IsNullOrWhiteSpace(ObjectUtil.QryStrGetValue(x.Options, "quantity")) ? (decimal?)null : Convert.ToDecimal(ObjectUtil.QryStrGetValue(x.Options, "quantity"))
                    };
                }
            }).ToList();
            _res.details = details.Distinct().ToList();
            _res.footer = new FileFormat.TextFileHeader()
            {
                prefix = "END",
                command = command,
                commandNo = commandNo,
                rowCount = _res.details.Count(),
                timestamp = DateTime.Now.ToString("yyyyMMdd hhMMss")
            };

            if(string.IsNullOrWhiteSpace(fileName))
                fileName = $"RES_{command}_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";

            var path = StaticValue.GetConfigValue("ERP.FTP.FTP_Res_Path") + fileName;
            this.CreateFileText(_res, path);



            return null;
        }

        public static string GetStringValueFromObject<T>(T obj, int removeCount)
        {
            var props = obj.GetType().GetProperties();
            List<string> str = new List<string>();
            foreach (var prp in props)
            {
                str.Add($"{prp.GetValue(obj)}");
            }
            var strJoin = string.Join("|", str);
            return strJoin.Remove(strJoin.Length - removeCount);
        }

        private void CreateFileText(ResponseFormat obj, string path)
        {
            var username = StaticValueManager.GetInstant().GetConfigValue("FTP_Username");
            var password = StaticValueManager.GetInstant().GetConfigValue("FTP_Password");

            if(FTPFileAccess.CheckFileExistsFromFTP(path, username, password))
                throw new AMWException(Logger, AMWExceptionCode.V1002, "พบไฟล์นี้ในระบบ");
            StringBuilder _str = new StringBuilder();
            _str.Append(GetStringValueFromObject(obj.header, 2));
            obj.details.ForEach(x =>
            {
                if(obj.header.command == "STOREOUT" || obj.header.command == "CANCELSTOREOUT")
                    _str.Append($"{Environment.NewLine}{GetStringValueFromObject(x, 0)}");
                else
                    _str.Append($"{Environment.NewLine}{GetStringValueFromObject(x, 1)}");
            });
            _str.Append($"{Environment.NewLine}{GetStringValueFromObject(obj.footer, 0)}");
            FTPFileAccess.UploadTextFileToFTP(_str.ToString(), path, username, password, BuVO.Logger);
        }
    }
}
