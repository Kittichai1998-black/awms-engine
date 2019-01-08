using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class CloseGRDocument : BaseEngine<CloseGRDocument.TDocReq, CloseGRDocument.TDocRes>
    {
        public class TDocReq
        {
            public long[] docIDs;
        }
        public class TDocRes
        {
            public List<SAPResposneAPI> sapDatas;
        }
   
        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            TDocRes res = new TDocRes() { sapDatas = new List<SAPResposneAPI>() };

            var docHs = this.ListAllDocumentHeadID(reqVO);

            foreach (var groupDocH in docHs
                                        .GroupBy(x => new {
                                            PSTNG_DATE = x.ParentDocument != null ? x.ParentDocument.ActionTime.Value : x.ActionTime.Value,
                                            DOC_DATE = x.ParentDocument != null ? x.ParentDocument.DocumentDate : x.DocumentDate,
                                            REF_DOC_NO = x.ParentDocument != null ? x.ParentDocument.Code : x.Code
                                        })
                                        .Select(x => new {
                                            PSTNG_DATE = x.Key.PSTNG_DATE,
                                            DOC_DATE = x.Key.DOC_DATE,
                                            REF_DOC_NO = x.Key.REF_DOC_NO,
                                            docHIDs = x.Select(y => y.ID.Value).ToList()
                                        }))
            {
                List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
                docHs.Where(x => groupDocH.docHIDs.Any(y => y == x.ID)).ToList().ForEach(x => docItems.AddRange(x.DocumentItems));

                SAPInterfaceReturnvalues sapReq = new SAPInterfaceReturnvalues()
                {
                    GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                    {
                        REF_DOC_NO = groupDocH.REF_DOC_NO ?? string.Empty,
                        DOC_DATE = groupDocH.DOC_DATE.ToString("yyyyMMdd"),
                        PSTNG_DATE = groupDocH.PSTNG_DATE.ToString("yyyyMMdd"),
                        HEADER_TXT = "ASRS Receive",
                        GOODSMVT_CODE = "04"
                    },
                    GOODSMVT_ITEM = docItems.Select(x => new SAPInterfaceReturnvalues.items()
                    {
                        MATERIAL = x.Code,
                        PLANT = this.StaticValue.Branchs.First(y => y.ID == docHs.First(z => z.ID == x.Document_ID).Sou_Branch_ID).Code,
                        STGE_LOC = this.StaticValue.Warehouses.First(y => y.ID == docHs.First(z => z.ID == x.Document_ID).Sou_Warehouse_ID).Code,
                        BATCH = x.Batch,
                        MOVE_TYPE = x.Ref2,
                        ENTRY_QNT = x.DocItemStos.Sum(y=>y.Quantity),
                        ENTRY_UOM = this.StaticValue.UnitTypes.First(y=>y.ID== x.UnitType_ID).Code,
                        MOVE_PLANT = this.StaticValue.Branchs.First(y => y.ID == docHs.First(z => z.ID == x.Document_ID).Des_Branch_ID).Code,
                        MOVE_STLOC = this.StaticValue.Warehouses.First(y => y.ID == docHs.First(z => z.ID == x.Document_ID).Des_Warehouse_ID).Code                        
                    }).ToList()
                };

                SAPResposneAPI sapRes = null;
                if (sapReq.GOODSMVT_ITEM.First().STGE_LOC != "5005")
                {
                    sapRes = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0001_FG_GOODS_RECEIPT(sapReq, this.BuVO);
                }
                else
                {
                    var skuMst = ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(docItems.First().SKUMaster_ID, this.BuVO);
                    var skuTypeMst = this.StaticValue.SKUMasterTypes.First(x => x.ID == skuMst.SKUMasterType_ID);
                    if(skuTypeMst.Code == "ZPAC")
                        sapRes = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0002_PACKAGE_GOODS_RECEIPT(sapReq, this.BuVO);
                    else
                        sapRes = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0003_CUSTOMER_RETURN(sapReq, this.BuVO);
                }
                res.sapDatas.Add(sapRes);

                if (sapRes.docstatus == "0")
                {
                    groupDocH.docHIDs.ForEach(x => {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, null, EntityStatus.ACTIVE, DocumentEventStatus.CLOSED, this.BuVO);
                    });
                }
            }
            return res;
        }

        private List<amt_Document> ListAllDocumentHeadID(TDocReq reqVO)
        {
            var baseDocs = new List<amt_Document>();
            reqVO.docIDs.ToList().ForEach(docID => {
                var doc = ADO.DocumentADO.GetInstant().ListParentLink(docID, this.BuVO);
                baseDocs.AddRange(doc);
            });

            List<long> docHIDs = new List<long>();
            docHIDs.AddRange(reqVO.docIDs);
            baseDocs.ForEach(x =>
            {
                var ids = ADO.DocumentADO.GetInstant().ListItem(x.ID.Value, this.BuVO).Select(y => y.LinkDocument_ID.Value).ToList();
                docHIDs.AddRange(ids);
            });
            docHIDs = docHIDs.Distinct().ToList();

            List<amt_Document> docHs = ADO.DocumentADO.GetInstant().List(docHIDs, this.BuVO);
            docHs.ForEach(docH =>
            {
                docH.ParentDocument = baseDocs.FirstOrDefault(x => x.ID == docH.ParentDocument_ID);
                docH.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndStoInDoc(docH.ID.Value, this.BuVO);
            });

            return docHs;
        }

    }
}