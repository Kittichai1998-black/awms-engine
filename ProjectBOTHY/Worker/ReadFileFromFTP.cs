using ADO.WMSStaticValue;
using AWMSEngine.HubService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Worker
{
    public class ReadFileFromFTP : AWMSEngine.WorkerService.BaseWorkerService
    {
        public ReadFileFromFTP(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        public class TextFileHeader
        {
            public string prefix;
            public string command;
            public string commandNo;
            public int? rowCount;
            public DateTime? timestamp;
        }
        public class ItemDetail
        {
            public string skuType;
            public string baseType;
            public string baseCode;
            public decimal? price;
            public string category;
            public string type;
            public string owner;
            public string cashcenter;
            public DateTime? receiveDate;
            public decimal? quantity;
            public string stationIn;
            public string stationOut;
        }

        public class TextFileDetail
        {
            public TextFileHeader header;
            public List<ItemDetail> details;
            public TextFileHeader footer;

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
                if(txtDetail.Count() > 0)
                {
                    var header = txtDetail.First().Split("|");
                    var footer = txtDetail.Last().Split("|");
                    var textDetails = new TextFileDetail()
                    {
                        header = new TextFileHeader()
                        {
                            prefix = header[0],
                            command = header[1],
                            commandNo = header[2],
                        },
                        footer = new TextFileHeader()
                        {
                            prefix = footer[0],
                            command = footer[1],
                            commandNo = footer[2],
                            rowCount = string.IsNullOrWhiteSpace(footer[3]) ? (int?)null : Convert.ToInt32(footer[3]),
                            timestamp = string.IsNullOrWhiteSpace(footer[4]) ? (DateTime?)null : Convert.ToDateTime(footer[4]),
                        }
                    };
                    if (header[1] == "STOREIN")
                    {
                        var docItemDetails = txtDetail.Skip(1).SkipLast(1).ToList();
                        var setDetail = docItemDetails.Select(x => {
                            var detail = x.Split("|");
                            return new ItemDetail()
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
                        this.CreateDocFromFTP(textDetails, DocumentTypeID.GOODS_RECEIVE, "", buVO);
                    }
                    else if (txtDetail[1] == "CANCELSTOREIN")
                    {

                    }
                    else if (txtDetail[1] == "CANCELSTOREOUT")
                    {

                    }
                }
            });
        }

        private amt_Document CreateDocFromFTP(TextFileDetail docItemDetail, DocumentTypeID docType, string options, VOCriteria buVO)
        {
            
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
                 Options = options
            };

            var _skuType = StaticValueManager.GetInstant().SKUMasterTypes.Find(y => y.Code == docItemDetail.details.First().skuType);
            var _baseType = StaticValueManager.GetInstant().BaseMasterTypes.Find(y => y.Code == docItemDetail.details.First().baseType);


            var docItem = docItemDetail.details.Select(x => {
                var pack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria()
                {
                    field = "Code",
                    value = x.price,
                    operatorType = SQLOperatorType.EQUALS
                }, buVO).FirstOrDefault();

                return new amt_DocumentItem()
                {
                    Code = pack.Code,
                    BaseCode = x.baseCode,
                    Quantity = x.quantity,
                    UnitType_ID = pack.UnitType_ID,
                    BaseQuantity = x.quantity,
                    BaseUnitType_ID = pack.UnitType_ID,
                    Batch = x.category,
                    OrderNo = x.type,
                    Ref1 = x.owner,
                    Ref2 = x.cashcenter
                };
            });




            return new amt_Document();
        }

        private void RejectDocFromFTP()
        {

        }
    }
}
