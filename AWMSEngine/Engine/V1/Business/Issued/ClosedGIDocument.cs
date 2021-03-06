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
                if (doc.EventStatus == DocumentEventStatus.CLOSED)
                    continue;

                var docHs = this.ListAllDocumentHeadID(reqVO);

                if (string.IsNullOrWhiteSpace(doc.Ref2) || doc.Ref2 == "311")
                {               
                    var DesWareDoc = ADO.DataADO.GetInstant().SelectByID<ams_Warehouse>(doc.Des_Warehouse_ID, this.BuVO);

                    var docItem = ADO.DocumentADO.GetInstant().ListItemAndDisto(docId, this.BuVO);

                    var relation = ADO.DocumentADO.GetInstant().ListParentLink(doc.ID.Value, this.BuVO);
                    if (relation.Count == 0)
                    {
                        if(doc.Ref2 == "311")
                        {
                            var dataApi4 = this.DataSendToApi4(
                            doc.ActionTime.Value.ToString("yyyyMMdd", new CultureInfo("en-US")),
                            doc.DocumentDate.ToString("yyyyMMdd", new CultureInfo("en-US")),
                            doc.ID.ToString(),
                            docItem,
                            doc.Ref2,
                            doc.SouBranch,
                            doc.SouWarehouse,
                            doc.DesWarehouse,
                            relation.Count,
                            DesWareDoc
                            );

                            if(dataApi4 != null)
                            {
                                var dataReturn = this.sendToApi4(dataApi4);
                                if (dataReturn.docstatus == "0")
                                {
                                    sandToSAPsuccess(docHs, docItem, dataReturn);
                                }
                                else
                                {
                                    sandToSAPfail(docHs, docItem, dataReturn);
                                }
                            }
                            else
                            {
                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,null, EntityStatus.ACTIVE, DocumentEventStatus.CLOSED, this.BuVO);
                            }
                        }
                        else
                        {
                            var dataApi9 = this.DataSendToApi9(
                            docItem,
                            doc.RefID,
                            doc.SouBranch,
                            doc.SouWarehouse
                            );


                            var dataReturn = this.sendToApi9(dataApi9);
                            if (dataReturn.docstatus == "0")
                            {
                                sandToSAPsuccess(docHs, docItem, dataReturn);
                                var docItemCheckClosed = ADO.DocumentADO.GetInstant().ListItemAndDisto(docId, this.BuVO);
                                var checkClosed = docItemCheckClosed.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSED || check.EventStatus == DocumentEventStatus.CLOSING);
                                if (checkClosed)
                                {
                                    this.CloseDocAndDocItem(doc.ID.Value);
                                }
                            }
                            else
                            {
                                sandToSAPfail(docHs, docItem, dataReturn);
                            }

                        }
                                     
                    }
                    else
                    {
                        var flag = docHs.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSING);
                        if (flag)
                        {
                            var rootIssue = docHs
                                .GroupBy(x => new { RefID = x.RefID })
                                .Select(x => new
                                {
                                    RefIDs = x.Key.RefID,
                                    IDs = x.Select(y => y.ID).ToList()
                                })
                            .ToList();

                            foreach (var root in rootIssue)
                            {
                               List<amt_DocumentItem> rootDocItems = new List<amt_DocumentItem>();
                                root.IDs.ForEach(x =>
                                {
                                    var diList = ADO.DocumentADO.GetInstant().ListItemAndDisto(x.Value, this.BuVO);
                                    rootDocItems.AddRange(diList);

                                });

                                if (doc.Ref2 == "311")
                                {
                                    var dataApi4 = this.DataSendToApi4(
                                    doc.ActionTime.Value.ToString("yyyyMMdd", new CultureInfo("en-US")),
                                    doc.DocumentDate.ToString("yyyyMMdd", new CultureInfo("en-US")),
                                    doc.ID.ToString(),
                                    rootDocItems,
                                    doc.Ref2,
                                    doc.SouBranch,
                                    doc.SouWarehouse,
                                    doc.DesWarehouse,
                                    relation.Count,
                                    DesWareDoc
                                    );

                                    if (dataApi4 != null)
                                    {

                                        var dataReturn = this.sendToApi4(dataApi4);
                                        if (dataReturn.docstatus == "0")
                                        {
                                            sandToSAPsuccess(docHs, docItem, dataReturn);
                                            this.ClosedDocAndParent(relation);
                                        }
                                        else
                                        {
                                            sandToSAPfail(docHs, docItem, dataReturn);
                                        }

                                    }
                                }
                                else
                                {
                                    var dataApi9 = this.DataSendToApi9(
                                    rootDocItems,
                                    doc.RefID,
                                    doc.SouBranch,
                                    doc.SouWarehouse
                                    );


                                    var dataReturn = this.sendToApi9(dataApi9);
                                    //SAPResposneAPI dataReturn = new SAPResposneAPI() { docstatus = "4" };
                                    if (dataReturn.docstatus == "0")
                                    {
                                        sandToSAPsuccess(docHs, docItem, dataReturn);
                                        this.ClosedDocAndParent(relation);

                                        //Change By TOM
                                        var docItemCheckClosed = ADO.DocumentADO.GetInstant().ListItemAndDisto(docId, this.BuVO);
                                        var checkClosed = docItemCheckClosed.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSED || check.EventStatus == DocumentEventStatus.CLOSING);
                                        if (checkClosed)
                                        {
                                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                                                   null, null,
                                                   DocumentEventStatus.CLOSED,
                                                   this.BuVO);
                                        }
                                    }
                                    else
                                    {
                                        sandToSAPfail(docHs, docItem, dataReturn);
                                    }
                                  
                                }
                                                      
                            }
                        }
                    }
                }
                else
                { 
                    this.CloseDocAndDocItem(doc.ID.Value);
                    var flag = docHs.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSED);
                        if (flag)
                        {
                            this.ClosedParent(docHs);
                        }
                }
            }
            return null;
        }

        private void sandToSAPfail(List<amt_Document> docHs, List<amt_DocumentItem> docItem, SAPResposneAPI sapRes)
        {           
            foreach (var d in docHs)
            {
                var docH = ADO.DataADO.GetInstant().SelectByID<amt_Document>(d.ID, this.BuVO);
                docH.Options = AMWUtil.Common.ObjectUtil.QryStrSetValue(docH.Options, "SapRes", string.Join(", ", sapRes.@return.Select(y => y.message).ToArray()));
                ADO.DocumentADO.GetInstant().Put(docH, this.BuVO);
                docItem.ForEach(di =>
                {
                    ADO.DocumentADO.GetInstant().PutItem(di, this.BuVO);
                });
            }
        }

        private void sandToSAPsuccess(List<amt_Document> docHs,List<amt_DocumentItem> docItem, SAPResposneAPI sapRes)
        {
            foreach (var d in docHs )
            {
                var docH = ADO.DataADO.GetInstant().SelectByID<amt_Document>(d.ID, this.BuVO);
                docH.RefID = !string.IsNullOrWhiteSpace(sapRes.mat_doc) ? sapRes.mat_doc : docH.RefID;
                docH.Ref1 = !string.IsNullOrWhiteSpace(sapRes.doc_year) ? sapRes.doc_year : docH.Ref1;
                docH.EventStatus = DocumentEventStatus.CLOSED;
                docH.Options = AMWUtil.Common.ObjectUtil.QryStrSetValue(docH.Options, "SapRes", string.Join(", ", sapRes.@return.Select(y => y.message).ToArray()));
                ADO.DocumentADO.GetInstant().Put(docH, this.BuVO);
                docItem.ForEach(di =>
                {
                    di.RefID = !string.IsNullOrWhiteSpace(sapRes.mat_doc) ? sapRes.mat_doc : di.RefID;
                    di.Ref1 = !string.IsNullOrWhiteSpace(sapRes.mat_doc) ? sapRes.mat_doc : di.Ref1;
                    di.EventStatus = DocumentEventStatus.CLOSED;
                    ADO.DocumentADO.GetInstant().PutItem(di, this.BuVO);

                });
            }
        }

        private void CloseDocAndDocItem(long docID)
        {
            ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID,
                null, null,
                DocumentEventStatus.CLOSED,
                this.BuVO);
        }

        private void ClosedParent(List<amt_Document> docHs)
        {
            docHs.ForEach(x =>
            {
                ADO.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>("EventStatus",DocumentEventStatus.CLOSED)
                });
            });
        }

        private void ClosedDocAndParent(List<amt_Document> Parent)
        {
            Parent.ForEach(x =>
            {
                ADO.DataADO.GetInstant().UpdateByID<amt_Document>(x.ID.Value, this.BuVO,
                new KeyValuePair<string, object>[]
                {
                    new KeyValuePair<string, object>("EventStatus",DocumentEventStatus.CLOSED)
                });
            });
        }

        private SAPResposneAPI sendToApi4(SAPInterfaceReturnvalues dataAPI4)
        {
            var resultAPI4 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0004_PLANT_STOCK_TRANSFER(dataAPI4, this.BuVO);
            return resultAPI4;
        }

        private SAPResposneAPI sendToApi9(SAPInterfaceReturnvaluesDOPick dataAPI9)
        {
            var resultAPI9 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0009_CONFORM_DELIVERY_ORDER_PICK(dataAPI9, this.BuVO);
            return resultAPI9;
        }

        private SAPInterfaceReturnvalues DataSendToApi4(string actionTime,string docDate,string docID,List<amt_DocumentItem> docItem,string Ref2,string SouBranch,string SouWarehouse,string DesWarehouse,long relation,ams_Warehouse DesWareDoc)
        {

            var dataAPI4 = new SAPInterfaceReturnvalues()
            {
                GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                {
                    PSTNG_DATE = actionTime,
                    DOC_DATE = docDate,
                    REF_DOC_NO = docID,
                    HEADER_TXT = "ASRS Trf with in Plant",
                    GOODSMVT_CODE = "04"

                },
                GOODSMVT_ITEM = new List<SAPInterfaceReturnvalues.items>()
            };

            foreach (var dataDocItem in docItem)
            {
                decimal check = 0;
                if (relation == 0)
                {
                    //check = dataDocItem.DocItemStos.Sum(x => x.Quantity).Value;
                    check = dataDocItem.DocItemStos.Where(x => x.Status == EntityStatus.ACTIVE).Sum(x => x.Quantity).Value;
                }
                else
                {
                    var diSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object> ("DocumentItem_ID",dataDocItem.ID)
                        }, this.BuVO);

                    check = diSto.Where(x => x.Status == EntityStatus.ACTIVE).Sum(x => x.Quantity).Value;
                }

                if (check == 0)
                {
                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(dataDocItem.ID.Value,
                        DocumentEventStatus.CLOSED, this.BuVO);

                    /*foreach (var stoDoc in dataDocItem.DocItemStos)
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusMappingSTO(stoDoc.ID.Value, 0, 0, EntityStatus.ACTIVE, this.BuVO);
                    }*/
                        
                }
                else
                {
                    var dataStoBranch = new List<dynamic>();
                    foreach (var stoDoc in dataDocItem.DocItemStos)
                    {
                        var sto = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(stoDoc.Sou_StorageObject_ID, BuVO);
                        //var sto = ADO.StorageObjectADO.GetInstant().Get(stoDoc.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                        if (sto.Batch != null)
                        {
                            dataStoBranch.Add(sto.Batch);
                        }
                    }
                    var stoBatch = dataStoBranch.Distinct().ToList();

                        foreach (var batchSto in stoBatch)
                        {
                            List<amt_DocumentItemStorageObject> stoData = ADO.StorageObjectADO.GetInstant().ListStoBacth(batchSto, dataDocItem.ID.Value, this.BuVO);
                            var stoQty = stoData.Sum(x => x.Quantity);


                            var itemDataAPI4 = new List<SAPInterfaceReturnvalues.items>();
                            dataAPI4.GOODSMVT_ITEM.Add(new SAPInterfaceReturnvalues.items()
                            {
                                MATERIAL = dataDocItem.Code,
                                PLANT = SouBranch,
                                STGE_LOC = SouWarehouse,
                                BATCH = batchSto,
                                MOVE_TYPE = Ref2,
                                ENTRY_QNT = stoQty.Value,
                                ENTRY_UOM = this.StaticValue.UnitTypes.First(x => x.ID == dataDocItem.UnitType_ID.Value).Code,
                                MOVE_STLOC = DesWarehouse,
                                MOVE_PLANT = DesWareDoc == null ? "" : this.StaticValue.Branchs.First(x => x.ID == DesWareDoc.Branch_ID.Value).Code,
                            });
                        }
                    
                }
            }
            if (dataAPI4.GOODSMVT_ITEM.Count == 0)
            {
                dataAPI4 = null;
            }
            return dataAPI4;
        }

        private SAPInterfaceReturnvaluesDOPick DataSendToApi9(List<amt_DocumentItem> docItem, string RefID, string SouBranch,string SouWarehouse)
        {
            var data = new SAPInterfaceReturnvaluesDOPick()
            {
                ITEM_DATA = new List<SAPInterfaceReturnvaluesDOPick.items>()
            };

            foreach (var dataDocItem in docItem)
            {
                if (dataDocItem.DocItemStos.Count == 0)
                {
                    data.ITEM_DATA.Add(new SAPInterfaceReturnvaluesDOPick.items()
                    {
                        DELIV_NUMB = dataDocItem.RefID,
                        DELIV_ITEM = ObjectUtil.QryStrGetValue(dataDocItem.Options, "DocItem"),
                        MATERIAL = dataDocItem.Code,
                        PLANT = SouBranch,
                        STGE_LOC = "",
                        BATCH = "",
                        DLV_QTY = dataDocItem.DocItemStos == null? "0" : dataDocItem.DocItemStos.Sum(x => x.Quantity).ToString(),
                        MOVE_PLANT = "",
                        SALES_UNIT = this.StaticValue.UnitTypes.First(x => x.ID == dataDocItem.UnitType_ID.Value).Code,

                    });
                }
                else
                {
                    var dataStoBranch = new List<string>();
                    foreach (var stoDoc in dataDocItem.DocItemStos)
                    {
                        var sto = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(stoDoc.Sou_StorageObject_ID, this.BuVO);
                        if (sto.Batch != null)
                        {
                            dataStoBranch.Add(sto.Batch);
                        }                                            
                    }

                    var stoBatch = dataStoBranch.Distinct().ToList();



                    foreach (var batchSto in stoBatch)
                    {
                        List<amt_DocumentItemStorageObject> stoData = ADO.StorageObjectADO.GetInstant().ListStoBacth(batchSto, dataDocItem.ID.Value, this.BuVO);
                        var stoQty = stoData.Sum(x => x.Quantity);

                        data.ITEM_DATA.Add(new SAPInterfaceReturnvaluesDOPick.items()
                        {
                            DELIV_NUMB = dataDocItem.RefID,
                            DELIV_ITEM = ObjectUtil.QryStrGetValue(dataDocItem.Options, "DocItem"),
                            MATERIAL = dataDocItem.Code,
                            PLANT = SouBranch,
                            STGE_LOC = SouWarehouse,
                            BATCH = batchSto,
                            DLV_QTY = stoQty.ToString(),
                            MOVE_PLANT = "",
                            SALES_UNIT = this.StaticValue.UnitTypes.First(x => x.ID == dataDocItem.UnitType_ID.Value).Code,

                        });
                    }
                }
            }
            return data;
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
                docH.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(docH.ID.Value, this.BuVO);
            });

            return docHs;
        }

    }
}