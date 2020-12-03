using ADO.WMSStaticValue;
using AMWUtil.Common;
using AMWUtil.DataAccess;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using ProjectBOTHY.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBOTHY.Engine.FileGenerate
{
    public class ErrorResponseGenerate : AWMSEngine.Engine.BaseEngine<ErrorResponseGenerate.Treq, ErrorResponseGenerate.ResponseError>
    {
        public class Treq : FileFormat.TextFileDetail
        {
            public string error;
        }

        public class ResponseError : ResponseFileFormat
        {
            public string error;
        }
        protected override ResponseError ExecuteEngine(Treq reqVO)
        {
            var _res = new ResponseError();
            var fileName = "";
            var command = reqVO.header.command;
            var commandNo = reqVO.header.commandNo;

            switch (reqVO.header.command)
            {
                case "STOREIN":
                    {
                        fileName = $"ERR_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "STOREOUT":
                    {
                        fileName = $"ERR_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "TRANSFER":
                    {
                        fileName = $"ERR_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CANCELSTOREIN":
                    {
                        fileName = $"ERR_CANCEL_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CANCELSTOREOUT":
                    {
                        fileName = $"ERR_CANCEL_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
                        break;
                    }
                case "CANCELTRANSFER":
                    {
                        fileName = $"ERR_CANCEL_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
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
            _res.error = reqVO.error;

            if (string.IsNullOrWhiteSpace(fileName))
                fileName = $"ERR_{command}_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";

            this.CreateFileText(_res, StaticValue.GetConfigValue("ERP.FILE.File_Err_Path"), fileName);

            return null;
        }

        private void CreateFileText(ResponseError obj, string path, string fileName)
        {
            //if (FTPFileAccess.CheckFileExistsFromFTP(path, username, password))
                //throw new AMWException(Logger, AMWExceptionCode.V1002, "พบไฟล์นี้ในระบบ");
            StringBuilder _str = new StringBuilder();
            _str.Append(ResponseGenerate.GetStringValueFromObject(obj.header, 2));
            obj.details.ForEach(x =>
            {
                if (obj.header.command == "STOREOUT" || obj.header.command == "CANCELSTOREOUT")
                    _str.Append($"{Environment.NewLine}{ResponseGenerate.GetStringValueFromObject(x, 0)}");
                else
                    _str.Append($"{Environment.NewLine}{ResponseGenerate.GetStringValueFromObject(x, 1)}");
            });
            _str.Append($"{Environment.NewLine}{ResponseGenerate.GetStringValueFromObject(obj.footer, 0)}");
            _str.Append($"{Environment.NewLine}ERROR : {obj.error}");
            LocalFileAccess.CreateTextFile(path, _str.ToString(), fileName);
        }
    }
}
