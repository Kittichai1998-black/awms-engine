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
    public class ErrorResponseGenerate : AWMSEngine.Engine.BaseEngine<amt_Document, ErrorResponseGenerate.ResponseError>
    {
        public class ResponseError : ResponseDocument.ResponseFormat
        {
            public string error;
        }
        protected override ResponseError ExecuteEngine(amt_Document reqVO)
        {
            var _res = new ResponseError();
            var fileName = "";
            var command = "";
            var commandNo = command == "CYCLECOUNT" ? DateTime.Now.ToString("yyyyMMdd hhMMss") : reqVO.Ref1;

            switch (reqVO.DocumentType_ID)
            {
                case DocumentTypeID.PUTAWAY:
                    {
                        if (reqVO.Status == EntityStatus.REMOVE)
                        {
                            fileName = $"ERR_CANCEL_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
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
                            fileName = $"ERR_CANCEL_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
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
                            fileName = $"ERR_CANCEL_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";
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
                    return new ResponseError.ResponseDetail()
                    {
                        skuType = ObjectUtil.QryStrGetValue(x.Options, "skuType"),
                        baseType = ObjectUtil.QryStrGetValue(x.Options, "baseType"),
                        baseCode = ObjectUtil.QryStrGetValue(x.Options, "baseCode")
                    };
                }
                else
                {
                    return new ResponseError.ResponseDetail()
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

            if (string.IsNullOrWhiteSpace(fileName))
                fileName = $"RES_{command}_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}.txt";

            var path = StaticValue.GetConfigValue("FTP_Err_Path") + fileName;
            this.CreateFileText(_res, path);

            return null;
        }

        private void CreateFileText(ResponseError obj, string path)
        {
            var username = StaticValueManager.GetInstant().GetConfigValue("FTP_Username");
            var password = StaticValueManager.GetInstant().GetConfigValue("FTP_Password");

            if (FTPFileAccess.CheckFileExistsFromFTP(path, username, password))
                throw new AMWException(Logger, AMWExceptionCode.V1002, "พบไฟล์นี้ในระบบ");
            StringBuilder _str = new StringBuilder();
            _str.Append(ResponseDocument.GetStringValueFromObject(obj.header, 2));
            obj.details.ForEach(x =>
            {
                if (obj.header.command == "STOREOUT" || obj.header.command == "CANCELSTOREOUT")
                    _str.Append($"{Environment.NewLine}{ResponseDocument.GetStringValueFromObject(x, 0)}");
                else
                    _str.Append($"{Environment.NewLine}{ResponseDocument.GetStringValueFromObject(x, 1)}");
            });
            _str.Append($"{Environment.NewLine}{ResponseDocument.GetStringValueFromObject(obj.footer, 0)}");
            _str.Append($"{Environment.NewLine}ERROR : {obj.error}");
            FTPFileAccess.UploadTextFileToFTP(_str.ToString(), path, username, password, BuVO.Logger);
        }
    }
}
