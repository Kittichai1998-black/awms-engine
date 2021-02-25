using AMWUtil.Logger;
using AWMSEngine.Engine;
using AMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AMSModel.Criteria.SP.Request;
using AMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.Issued;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;
using System.Text.RegularExpressions;

namespace ProjectGCL.Engine.Document
{
    public class CreateDocIssueList : BaseEngine<CreateDocIssueList.TReq, CreateDocIssueList.TRes>
    {

        public class TReq : AMWRequestCreateGIDocList
        {
        }
        public class TRes
        {
            public List<Record> Record;
        }
        public class Record
        {
            public string api_ref;
            public string doc_wms;
            public string doc_wcs;
            public DateTime Date_time;
        }
        public class ResConfirmResult
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var resRecord = new List<Record>();
            amt_Document documentPK = new amt_Document();
            foreach (var line in reqVO.RECORD)
            {
                amt_Document document = new amt_Document();
                
                ResConfirmResult dataProcessQ = new ResConfirmResult();
                string[] stagingwords = line.LINE.staging.Split(",-,-");
                string[] docwords = line.LINE.Dock_no.Split(",-,-");
                var staging = this.genStaging(this.Logger, stagingwords[0], this.BuVO);

                var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                   new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",line.LINE.sku, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                   }, this.BuVO).FirstOrDefault();

                if (sku == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี sku นี้ในระบบ");

                var pack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("SKUMaster_ID",sku.ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                if (pack == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี pack นี้ในระบบ");

                var warehouse = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Warehouse>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",line.LINE.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                if (warehouse == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

                var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                   new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("Code",line.LINE.staging,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.MC_GATE, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                   }, this.BuVO).FirstOrDefault();

             

                document = this.CreateDocGI(this.Logger, line, warehouse, staging, area, sku, pack, docwords[0], this.BuVO);
                documentPK = this.CreateDocPK(this.Logger, line, warehouse, staging, area, sku, pack, document, docwords[0], this.BuVO);
                //dataProcessQ = this.AutoProcess(documentPK, true, staging, reqVO, this.BuVO);

                resRecord.Add(new Record
                {
                    api_ref = line.LINE.api_ref,
                    doc_wms = line.LINE.doc_wms,
                    doc_wcs = document.Code,
                    Date_time = line.LINE.Date_time
                  
                });
            }

            var res = new TRes()
            {
                Record = resRecord
            };

            return res;

        }
        private amt_Document CreateDocGI(AMWLogger logger, AMWRequestCreateGIDocList.RECORD_LIST line, ams_Warehouse warehouse, ams_AreaMaster staging, ams_AreaMaster area, ams_SKUMaster sku, ams_PackMaster pack, string docwords, VOCriteria buVO)
        {
            amt_Document docResultGI = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_STAGING, line.LINE.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_DOCK, string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_ISSUE,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                souBranchID = null,
                desAreaMasterCode = staging.Code,
                desBranchID = null,
                //forCustomerCode = line.LINE..customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = line.LINE.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseCode = line.LINE.warehouse,
                desWarehouseCode = line.LINE.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = line.LINE.qty,
                baseQuantity = line.LINE.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                batch = null,
                lot = line.LINE.lot,
                orderNo = null,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultGI = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultGI;

        }
        private amt_Document CreateDocPK(AMWLogger logger, AMWRequestCreateGIDocList.RECORD_LIST line, ams_Warehouse warehouse, ams_AreaMaster staging, ams_AreaMaster area, ams_SKUMaster sku, ams_PackMaster pack, amt_Document DocGI, string docwords, VOCriteria buVO)
        {
            amt_Document docResultPK = new amt_Document();
            List<CreateGIDocument.TReq.IssueItem> docItemsList = new List<CreateGIDocument.TReq.IssueItem>();

            var giDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(DocGI.ID.Value, this.BuVO);

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_STAGING, line.LINE.staging);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_DOCK, string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGIDocument.TReq()
            {
                documentTypeID = DocumentTypeID.PICKING,
                parentDocumentID = DocGI.ID.Value,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                souBranchID = null,
                desAreaMasterCode = staging.Code,
                desBranchID = null,
                forCustomerCode = line.LINE.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = line.LINE.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseCode = line.LINE.warehouse,
                desWarehouseCode = line.LINE.warehouse,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGIDocument.TReq.IssueItem
            {
                parentDocumentItem_ID = giDocItem[0].ID,
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = line.LINE.qty,
                baseQuantity = line.LINE.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                batch = null,
                lot = line.LINE.lot,
                orderNo = null,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                ref3 = string.IsNullOrWhiteSpace(docwords) ? (area != null ? line.LINE.staging : staging.Code) : docwords,
                ref4 = line.LINE.group_task,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.issueItems = docItemsList;
            docResultPK = new CreateGIDocument().Execute(Logger, this.BuVO, docH);

            return docResultPK;

        }
        private ams_AreaMaster genStaging(AMWLogger logger, string stagingwords, VOCriteria buVO)
        {

            var stagingData = Regex.Replace(stagingwords, "^.*[^0-9]([0-9]+)$", "$1");

            if (stagingData == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Format staging ไม่ถูกต้อง");

            ams_AreaMaster staging = new ams_AreaMaster();
            var listAreaCode = new List<int>();
            var stagingNumber = Convert.ToInt32(stagingData);
            var minStaging = new int();
            var maxStaging = new int();
            var checkMin = new int();
            var checkMax = new int();
            var resultStaging = new int();

            var areastaging = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",stagingwords,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STA_CONSO, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STA_CONSO, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO);

            if (areastaging != null)
            {
                staging = areastaging;
            }
            else
            {
                foreach (var ar in area)
                {
                    var arData = Regex.Replace(ar.Code, "^.*[^0-9]([0-9]+)$", "$1");
                    if (arData == null)
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Format staging ใน database ไม่ถูกต้อง");
                    listAreaCode.Add(Convert.ToInt32(arData));
                }

                minStaging = listAreaCode.Min();
                maxStaging = listAreaCode.Max();

                if (minStaging > stagingNumber)
                {
                    checkMin = minStaging - stagingNumber;
                }
                else
                {
                    checkMin = stagingNumber - minStaging;
                }

                if (maxStaging > stagingNumber)
                {
                    checkMax = maxStaging - stagingNumber;
                }
                else
                {
                    checkMax = stagingNumber - maxStaging;
                }

                if (checkMin < checkMax)
                {
                    resultStaging = minStaging;
                }
                else
                {
                    resultStaging = maxStaging;
                }


                staging = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
                           new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Code","%"+resultStaging.ToString()+"%",SQLOperatorType.LIKE),
                                new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                           }, this.BuVO).FirstOrDefault();

            }


            return staging;
        }
    }
}
