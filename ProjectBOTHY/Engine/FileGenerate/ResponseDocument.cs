using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using ProjectBOTHY.Model;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                            fileName = $"RES_CANCEL_STOREIN_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}";
                            command = "CANCELSTOREIN";
                        }
                        else
                        {
                            command = "STOREIN";
                        }
                        break;
                    }
                case DocumentTypeID.PICKING:
                    {
                        if (reqVO.Status == EntityStatus.REMOVE)
                        {
                            fileName = $"RES_CANCEL_STOREOUT_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}";
                            command = "CANCELSTOREOUT";
                        }
                        else
                        {
                            command = "STOREOUT";
                        }
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
                            fileName = $"RES_CANCEL_TRANSFER_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}";
                            command = "CANCELTRANSFER";
                        }
                        else
                        {
                            command = "TRANSFER";
                        }
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
                fileName = $"RES_{command}_{commandNo}_{DateTime.Now.ToString("yyyyMMdd")}";


            StaticValue.GetConfigValue("FTP_RES_PATH");

            //if(File.Exists())




            return null;
        }

        public string GetStringValueFromObject<T>(T obj)
        {
            var props = obj.GetType().GetProperties();
            List<string> str = new List<string>();
            foreach (var prp in props)
            {
                str.Add($"{prp.GetValue(obj)}");
            }
            return string.Join("|", str);
        }
    }
}
