using ADO.WMSStaticValue;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.HubService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjectBOTHY.Model;

namespace ProjectBOTHY.Worker
{
    public class ReadFileFromFTP : AWMSEngine.WorkerService.BaseWorkerService
    {
        public ReadFileFromFTP(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        public class TextFileDetail
        {
            public FileFormat.TextFileHeader header;
            public List<FileFormat.ItemDetail> details;
            public FileFormat.TextFileHeader footer;
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var path = StaticValueManager.GetInstant().GetConfigValue("FTP_Path");
            var username = StaticValueManager.GetInstant().GetConfigValue("FTP_Username");
            var password = StaticValueManager.GetInstant().GetConfigValue("FTP_Password");
            var _text = AMWUtil.DataAccess.FTPFileAccess.ReadAllFileFromFTP(path, username, password, "txt", buVO.Logger);
            _text.ForEach(x =>
            {
                var txtDetail = x.Value.Split("\r\n");
                if (txtDetail.Count() > 0)
                {
                    var header = txtDetail.First().Split("|");
                    var footer = txtDetail.Last().Split("|");
                    var textDetails = new TextFileDetail()
                    {
                        header = new FileFormat.TextFileHeader()
                        {
                            prefix = header[0],
                            command = header[1],
                            commandNo = header[2],
                        },
                        footer = new FileFormat.TextFileHeader()
                        {
                            prefix = footer[0],
                            command = footer[1],
                            commandNo = footer[2],
                            rowCount = string.IsNullOrWhiteSpace(footer[3]) ? (int?)null : Convert.ToInt32(footer[3]),
                            timestamp = string.IsNullOrWhiteSpace(footer[4]) ? null : footer[4],
                        }
                    };
                    if (textDetails.header.command == "STOREIN")
                    {
                        var docItemDetails = txtDetail.Skip(1).SkipLast(1).ToList();
                        var setDetail = docItemDetails.Select(x =>
                        {
                            var detail = x.Split("|");
                            return new FileFormat.ItemDetail()
                            {
                                skuType = detail[0],
                                baseType = detail[1],
                                baseCode = detail[2],
                                price = string.IsNullOrWhiteSpace(detail[3]) ? (decimal?)null : Convert.ToDecimal(detail[3]),
                                category = detail[4],
                                type = detail[5],
                                owner = detail[6],
                                cashcenter = detail[7],
                                receiveDate = string.IsNullOrWhiteSpace(detail[8]) ? (DateTime?)null : Convert.ToDateTime(detail[8]),
                                quantity = string.IsNullOrWhiteSpace(detail[9]) ? (decimal?)null : Convert.ToDecimal(detail[9]),
                                stationIn = detail[10],
                                stationOut = detail[11],
                            };
                        }).ToList();
                        textDetails.details = setDetail;
                        this.CreateDocFromFTP(textDetails, DocumentTypeID.GOODS_RECEIVE, null, buVO);
                    }
                    else if (textDetails.header.command.StartsWith("CANCEL"))
                    {
                        var docs = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria()
                        {
                            field = "RefID",
                            value = textDetails.header.commandNo,
                            operatorType = SQLOperatorType.EQUALS
                        }, buVO);

                        if (docs.Any(x => x.EventStatus != DocumentEventStatus.NEW))
                        {
                            throw new AMWException(buVO.Logger, AMWExceptionCode.V1001);
                        }
                        else
                        {
                            docs.Select(x => x.ID).ToList().ForEach(x =>
                                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(x.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, buVO)
                            );
                        }
                    }
                }
            });
        }

        private amt_Document CreateDocFromFTP(TextFileDetail docItemDetail, DocumentTypeID docType, string options, VOCriteria buVO)
        {
            ams_AreaMaster _desArea = new ams_AreaMaster();
            ams_AreaMaster _souArea = new ams_AreaMaster();

            if (docItemDetail.header.command == "STOREIN")
            {
                _desArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationIn);
            }
            else if (docItemDetail.header.command == "STOREOUT")
            {
                _desArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationOut);
            }
            else if (docItemDetail.header.command == "TRANSFER")
            {
                _desArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationOut);
                _souArea = StaticValueManager.GetInstant().AreaMasters.Find(y => y.Code == docItemDetail.details.First().stationIn);
            }

            var parentDoc = new amt_Document()
            {
                ActionTime = DateTime.Now,
                DocumentDate = DateTime.Now,
                DocumentProcessType_ID = DocumentProcessTypeID.FG_TRANSFER_WM,
                DocumentItems = null,
                DocumentType_ID = docType,
                ParentDocument = null,
                DocumetnChilds = null,
                EventStatus = DocumentEventStatus.NEW,
                ProductOwner_ID = docItemDetail.details.First().owner == "BOT" ? 1 : 2,
                Status = EntityStatus.ACTIVE,
                Options = options,
                Des_Warehouse_ID = _desArea.Warehouse_ID,
                Des_AreaMaster_ID = _desArea.ID,
                Sou_AreaMaster_ID = _souArea.ID,
                RefID = docItemDetail.header.commandNo
            };

            var _skuType = StaticValueManager.GetInstant().SKUMasterTypes.Find(y => y.Code == docItemDetail.details.First().skuType);
            var _baseType = StaticValueManager.GetInstant().BaseMasterTypes.Find(y => y.Code == docItemDetail.details.First().baseType);

            var docItem = docItemDetail.details.Select(x =>
            {
                var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Code", x.price, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Price", x.price, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Info1", x.category, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Info2", x.type, SQLOperatorType.EQUALS)
                }, buVO).FirstOrDefault();

                return new amt_DocumentItem()
                {
                    Code = sku.Code,
                    BaseCode = x.baseCode,
                    Quantity = x.quantity,
                    UnitType_ID = sku.UnitType_ID,
                    BaseQuantity = x.quantity,
                    BaseUnitType_ID = sku.UnitType_ID,
                    Ref1 = x.owner,
                    Options = ObjectUtil.ObjectToQryStr(x)
                };
            }).ToList();

            var parentRes = ADO.WMSDB.DocumentADO.GetInstant().Create(parentDoc, buVO);

            var childDoc = parentRes.Clone();
            childDoc.DocumentType_ID = docType == DocumentTypeID.GOODS_RECEIVE ? DocumentTypeID.PUTAWAY : DocumentTypeID.PICKING;
            childDoc.EventStatus = DocumentEventStatus.NEW;
            childDoc.ParentDocument_ID = parentRes.ID;
            childDoc.DocumentItems = parentRes.DocumentItems.Clone().Select(x =>
            {
                x.ParentDocumentItem_ID = x.ID;
                x.ID = null;
                return x;
            }).ToList();

            var childRes = ADO.WMSDB.DocumentADO.GetInstant().Create(childDoc, buVO);
            parentRes.DocumetnChilds = new List<amt_Document>() { childRes };
            return parentRes;
        }
    }
}
