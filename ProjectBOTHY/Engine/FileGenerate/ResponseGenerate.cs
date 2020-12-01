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
    public class ResponseGenerate : AWMSEngine.Engine.BaseEngine<FileFormat.TextFileDetail, ResponseFileFormat>
    {
        protected override ResponseFileFormat ExecuteEngine(FileFormat.TextFileDetail reqVO)
        {
            var _res = new ResponseFileFormat();
            var fileName = "";
            var command = reqVO.header.command;
            var commandNo = command == "CYCLECOUNT" ? DateTime.Now.ToString("yyyyMMddhhMMss") : reqVO.header.commandNo;

            switch (reqVO.header.command)
            {
                case "STOREIN":
                    {
                        fileName = $"RES_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "STOREOUT":
                    {
                        fileName = $"RES_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "TRANSFER":
                    {
                        fileName = $"RES_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CANCELSTOREIN":
                    {
                        fileName = $"RES_CANCEL_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CANCELSTOREOUT":
                    {
                        fileName = $"RES_CANCEL_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CANCELTRANSFER":
                    {
                        fileName = $"RES_CANCEL_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CYCLECOUNT":
                    {
                        fileName = $"RES_CYCLECOUNT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
            }

            _res.header = new FileFormat.TextFileHeader()
            {
                prefix = "START",
                command = command,
                commandNo = commandNo
            };

            var details = reqVO.details.Select(x =>
            {
                if (command != "STOREOUT" && command != "CANCELSTOREOUT")
                {
                    return new ResponseFileFormat.ResponseDetail()
                    {
                        skuType = x.skuType,
                        baseType = x.baseType,
                        baseCode = x.baseCode
                    };
                }
                else
                {
                    return new ResponseFileFormat.ResponseDetail()
                    {
                        skuType = x.skuType,
                        baseType = x.baseType,
                        baseCode = x.baseCode,
                        quantity = (int?)x.quantity
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

            var path = StaticValue.GetConfigValue("ERP.FTP.FTP_Root_Path") + StaticValue.GetConfigValue("ERP.FTP.FTP_Res_Path") + fileName;
            this.CreateFileText(_res, path);
            return null;
        }

        public static string GetStringValueFromObject<T>(T obj, int removeCount)
        {
            var props = obj.GetType().GetFields();
            List<string> str = new List<string>();
            foreach (var prp in props)
            {
                str.Add($"{prp.GetValue(obj)}");
            }
            var strJoin = string.Join("|", str);
            if (removeCount > 0)
                return strJoin.Remove(strJoin.Length - removeCount);
            else
                return strJoin;
        }

        private void CreateFileText(ResponseFileFormat obj, string path)
        {
            var username = StaticValueManager.GetInstant().GetConfigValue("ERP.FTP.FTP_Username");
            var password = StaticValueManager.GetInstant().GetConfigValue("ERP.FTP.FTP_Password");

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
