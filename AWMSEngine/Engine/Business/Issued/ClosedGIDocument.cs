using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ClosedGIDocument : BaseEngine<ClosedGIDocument.TDocReq, SAPInterfaceReturnvaluesDOPick>
    {
        public class TDocReq
        {
            public long[] docIDs;

            
        }
        public class TDocRes
        {
            public SAPInterfaceReturnvaluesDOPick dataSAP;
        }

        protected override SAPInterfaceReturnvaluesDOPick ExecuteEngine(TDocReq reqVO)
        {
           
            foreach (var docId in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(docId, this.BuVO);


                //var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                //    new KeyValuePair<string, object> ("Document_ID",num)
                //}, this.BuVO);

                var docItem = ADO.DocumentADO.GetInstant().ListItemAndStoInDoc(docId, this.BuVO);

                var docHs = this.ListAllDocumentHeadID(reqVO);


                var relation = ADO.DocumentADO.GetInstant().ListParentLink(doc.ID.Value, this.BuVO);
                if (relation.Count == 0)
                {

                    var dataAPI4 = new SAPInterfaceReturnvalues()
                    {
                        GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                        {
                            PSTNG_DATE = doc.ActionTime.Value.ToString("yyyyMMdd", new CultureInfo("en-US")),
                            DOC_DATE = doc.DocumentDate.ToString("yyyyMMdd", new CultureInfo("en-US")),
                            REF_DOC_NO = doc.ID.ToString(),
                            HEADER_TXT = "ASRS Trf within Plant",
                            GOODSMVT_CODE = "04"

                        },
                        GOODSMVT_ITEM = new List<SAPInterfaceReturnvalues.items>()
                    };

                    var data = new SAPInterfaceReturnvaluesDOPick()
                    {
                        ITEM_DATA = new List<SAPInterfaceReturnvaluesDOPick.items>()
                    };


                    foreach (var dataDocItem in docItem)
                    {
                        if (dataDocItem.DocItemStos.Sum(x => x.Quantity) == 0)
                        {
                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(dataDocItem.ID.Value,
                                DocumentEventStatus.CLOSED, this.BuVO);
                        }
                        else
                        {
                            //var itemData = new List<SAPInterfaceReturnvaluesDOPick.items>();
                            data.ITEM_DATA.Add(new SAPInterfaceReturnvaluesDOPick.items()
                            {
                                DELIV_NUMB = doc.RefID,
                                DELIV_ITEM = dataDocItem.Options == null ? (decimal?)null : decimal.Parse(ObjectUtil.QryStrGetValue(dataDocItem.Options, "DocItem")),
                                MATERIAL = dataDocItem.Code,
                                PLANT = doc.SouBranch,
                                STGE_LOC = doc.SouWarehouse,
                                BATCH = dataDocItem.Batch,
                                //DLV_QTY = dataDocItem.Quantity.ToString(),
                                DLV_QTY = dataDocItem.DocItemStos.Sum(x => x.Quantity).ToString(),
                                SALES_UNIT = this.StaticValue.UnitTypes.First(x => x.ID == dataDocItem.UnitType_ID.Value).Code,

                            });

                            var itemDataAPI4 = new List<SAPInterfaceReturnvalues.items>();
                            dataAPI4.GOODSMVT_ITEM.Add(new SAPInterfaceReturnvalues.items()
                            {
                                MATERIAL = dataDocItem.Code,
                                PLANT = doc.SouBranch,
                                STGE_LOC = doc.SouWarehouse,
                                BATCH = dataDocItem.Batch,
                                MOVE_TYPE = doc.Ref2,
                                ENTRY_QNT = dataDocItem.DocItemStos.Sum(x => x.Quantity.Value),
                                ENTRY_UOM = this.StaticValue.UnitTypes.First(x => x.ID == dataDocItem.UnitType_ID.Value).Code,
                                MOVE_STLOC = doc.DesWarehouse,
                            });

                        }
                    }
                    var docItemCheckClosed = ADO.DocumentADO.GetInstant().ListItemAndStoInDoc(docId, this.BuVO);
                    var checkClosed = docItemCheckClosed.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSED);
                    if (checkClosed)
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                               null, null,
                               DocumentEventStatus.CLOSED,
                               this.BuVO);
                    }
                    //send to SAP
                        var docStatus4 = "";
                        var docStatus9 = "";

                            if (doc.Ref2 != null)
                            {
                                var resultAPI4 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0004_PLANT_STOCK_TRANSFER(dataAPI4, this.BuVO);
                                docStatus4 = resultAPI4.docstatus;
                            }
                            else
                            {
                                var resultAPI9 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0009_CONFORM_DELIVERY_ORDER_PICK(data, this.BuVO);
                                docStatus9 = resultAPI9.docstatus;
                            }
             
                        if( docStatus4 == "0" || docStatus9 == "0")
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                            null, null,
                            DocumentEventStatus.CLOSED,
                            this.BuVO);
                        }
                    //send to SAP
                }
                else
                {
                    var flag = docHs.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSING );
                    if (flag)
                    {
                        //var groupBySGI = new List<SAPInterfaceReturnvaluesDOPick>();
                        //start groupDoc
                        var rootIssue = docHs
                            .GroupBy(x => new { RefID = x.RefID})
                            .Select(x => new {
                                RefIDs = x.Key.RefID,
                                IDs = x.Select(y => y.ID).ToList()
                            })
                        .ToList();
                        //start groupDoc

                        foreach (var root in rootIssue)
                        {
                          
                            List<amt_DocumentItem> rootDocItems = new List<amt_DocumentItem>();
                            root.IDs.ForEach(x =>
                            {
                                var diList = ADO.DocumentADO.GetInstant().ListItem(x.Value, this.BuVO);
                                rootDocItems.AddRange(diList);

                            });

                            var postData = new SAPInterfaceReturnvaluesDOPick()
                            {
                                ITEM_DATA = new List<SAPInterfaceReturnvaluesDOPick.items>()
                            };

                            var dataAPI4 = new SAPInterfaceReturnvalues()
                            {
                                GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                                {
                                    PSTNG_DATE = doc.ActionTime.Value.ToString("yyyyMMdd", new CultureInfo("en-US")),
                                    DOC_DATE = doc.DocumentDate.ToString("yyyyMMdd", new CultureInfo("en-US")),
                                    REF_DOC_NO = doc.ID.ToString(),
                                    HEADER_TXT = "ASRS Trf within Plant",
                                    GOODSMVT_CODE = "04"

                                },
                                GOODSMVT_ITEM = new List<SAPInterfaceReturnvalues.items>()
                            };

                            foreach (var dataList in rootDocItems)
                            {
                               var diSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new KeyValuePair<string, object>[] {
                                   new KeyValuePair<string, object> ("DocumentItem_ID",dataList.ID)
                                   }, this.BuVO);

                                if (diSto.Sum(x => x.Quantity) == 0)
                                {
                                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(dataList.ID.Value,
                                        DocumentEventStatus.CLOSED, this.BuVO);
                                }
                                else
                                {
                                    postData.ITEM_DATA.Add(new SAPInterfaceReturnvaluesDOPick.items()
                                    {
                                        DELIV_NUMB = doc.RefID,
                                        DELIV_ITEM = dataList.Options == null ? (decimal?)null : long.Parse(ObjectUtil.QryStrGetValue(dataList.Options, "DocItem")),
                                        MATERIAL = dataList.Code,
                                        PLANT = doc.SouBranch,
                                        STGE_LOC = doc.SouWarehouse,
                                        BATCH = dataList.Batch,
                                        DLV_QTY = diSto.Sum(x => x.Quantity).ToString(),
                                        SALES_UNIT = this.StaticValue.UnitTypes.First(x => x.ID == dataList.UnitType_ID.Value).Code,
                                    });

                                    var itemDataAPI4 = new List<SAPInterfaceReturnvalues.items>();
                                    dataAPI4.GOODSMVT_ITEM.Add(new SAPInterfaceReturnvalues.items()
                                    {
                                        MATERIAL = dataList.Code,
                                        PLANT = doc.SouBranch,
                                        STGE_LOC = doc.SouWarehouse,
                                        BATCH = dataList.Batch,
                                        MOVE_TYPE = doc.Ref2,
                                        ENTRY_QNT = diSto.Sum(x => x.Quantity.Value),
                                        ENTRY_UOM = this.StaticValue.UnitTypes.First(x => x.ID == dataList.UnitType_ID.Value).Code,
                                        MOVE_STLOC = doc.DesWarehouse,
                                    });

                                    //groupBySGI.Add(postData);
                                }

                            }
                            var docItemCheckClosed = ADO.DocumentADO.GetInstant().ListItemAndStoInDoc(docId, this.BuVO);
                            var checkClosed = docItemCheckClosed.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSED);
                            if (checkClosed)
                            {
                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                                       null, null,
                                       DocumentEventStatus.CLOSED,
                                       this.BuVO);
                            }

                            var docStatus4 = "";
                                var docStatus9 = "";

                                    if (doc.Ref2 != null)
                                    {
                                        var resultAPI4 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0004_PLANT_STOCK_TRANSFER(dataAPI4, this.BuVO);
                                        docStatus4 = resultAPI4.docstatus;
                                    }
                                    else
                                    {
                                        var resultAPI9 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0009_CONFORM_DELIVERY_ORDER_PICK(postData, this.BuVO);
                                        docStatus9 = resultAPI9.docstatus;

                                    }
                               
                                if (docStatus4 == "0" || docStatus9 == "0")
                                {
                                docHs.ForEach(x =>
                                    {
                                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value,
                                        null, null,
                                        DocumentEventStatus.CLOSED,
                                        this.BuVO);

                                        ADO.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                                        new KeyValuePair<string, object>[]
                                        {
                                            new KeyValuePair<string, object>("EventStatus",DocumentEventStatus.CLOSED)
                                        });
                                    });
                                }

                                
                        }

                    }
                    
                }

            }
            return null;
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