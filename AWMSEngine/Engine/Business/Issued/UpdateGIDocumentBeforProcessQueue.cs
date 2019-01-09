using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.SAPApi;
using AWMSEngine.APIService.Api2;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class UpdateGIDocumentBeforProcessQueue : BaseEngine<UpdateGIDocumentBeforProcessQueue.TReq, UpdateGIDocumentBeforProcessQueue.TRes>
    {
        public class TReq
        {
            public List<TDoc> docs;
            public class TDoc
            {
                public long docID;
                public DocumentTypeID docType;
            }
        }
        public class TRes
        {
            public List<amt_DocumentItem> documentItems;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            res.documentItems = new List<amt_DocumentItem>();

            var docs = new List<amt_Document>();
            reqVO.docs.ForEach(doc => {
                if (!docs.Any(x => x.ID == doc.docID))
                {
                    if(doc.docType == DocumentTypeID.SUPER_GOODS_ISSUED)
                    {
                        var _docs = ADO.DataADO.GetInstant().SelectBy<amt_Document>("ParentDocument_ID", doc.docID, this.BuVO).FindAll(x => x.EventStatus == DocumentEventStatus.IDEL);
                        docs.AddRange(_docs);
                    }
                    else if(doc.docType == DocumentTypeID.GOODS_ISSUED)
                    {
                        var _doc = ADO.DocumentADO.GetInstant().Get(doc.docID, this.BuVO);
                        if (_doc.EventStatus == DocumentEventStatus.IDEL)
                            docs.Add(_doc);
                    }
                }
            });
            docs.ForEach(x => x.DocumentItems = ADO.DocumentADO.GetInstant().ListItem(x.ID.Value, this.BuVO));

            //var sapDOs = new List<TRES_MMI0008_1_DO_INFO>();
            foreach (string refID in docs.GroupBy(x => x.RefID).Select(x => x.Key))
            {
                if(!string.IsNullOrWhiteSpace(refID))
                {
                    ADO.SAPApi.TREQ_MMI0008_1_DO_INFO tReq =
                        new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO()
                        {
                            HEADER_DATA = new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO.THeader()
                            {
                                DELIV_ITEM = refID,
                                DELIV_NUMB = string.Empty
                            }
                        };
                    var sapDO = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0008_1_DO_INFO(tReq, this.BuVO);
                    //sapDOs.Add(sapDO);
                    var docItems = this.UpdateGIDocBySapDO(sapDO, docs.FindAll(x => x.RefID == refID));
                    res.documentItems.AddRange(docItems);
                }
                else
                {
                    docs.FindAll(x => x.RefID == refID).ForEach(doc => { res.documentItems.AddRange(doc.DocumentItems); });
                }
            }

            return res;
        }

        public List<amt_DocumentItem> UpdateGIDocBySapDO(TRES_MMI0008_1_DO_INFO sapDO, List<amt_Document> docRefSAPs)
        {
            List<amt_DocumentItem> docItemRefSAPs = new List<amt_DocumentItem>();
            if (sapDO.DOCSTATUS == "0")
            {
                List<long> flagCheckDocItems = new List<long>();
                docRefSAPs.ForEach(doc =>
                {
                    docItemRefSAPs.AddRange(doc.DocumentItems);
                });

                foreach (var sapDOItem in sapDO.ITEM_DATA)
                {

                    var docItem = docItemRefSAPs.FirstOrDefault(x => ObjectUtil.QryStrGetValue(x.Options, "DocItem") == sapDOItem.DELIV_ITEM);
                    var souWarehouses = this.StaticValue.Warehouses.First(x => x.Code == sapDOItem.STGE_LOC);
                    var desCustomer = this.StaticValue.Customers.First(x => x.Code == sapDOItem.SHIPTO_CODE);
                    var sapUnit = this.StaticValue.UnitTypes.First(x => x.Code == sapDOItem.SALES_UNIT && x.ObjectType == StorageObjectType.PACK);
                    var newUnit = this.StaticValue.ConvertToBaseUnitBySKU(sapDOItem.MATERIAL, sapDOItem.DLV_QTY, sapUnit.ID.Value);
                    if (newUnit.baseQty != sapDOItem.DLV_QTY_IMUNIT)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Convert Sale Qty ได้ไม่ตรงกัน");

                    var docRefSAP = docRefSAPs.FirstOrDefault(x => x.Des_Customer_ID == desCustomer.ID && x.Sou_Warehouse_ID == souWarehouses.ID);
                    //Create Doc
                    if (docRefSAP == null)
                    {
                        docRefSAP = new amt_Document()
                        {
                            Des_Customer_ID = desCustomer.ID,
                            Sou_Warehouse_ID = souWarehouses.ID,
                            Sou_Branch_ID = souWarehouses.Branch_ID,
                            EventStatus = DocumentEventStatus.IDEL,
                            RefID = sapDOItem.DELIV_NUMB,
                            Options = "DocType=" + sapDOItem.DLV_TYPE,
                            ActionTime = DateTime.Now,
                            DocumentDate = DateTime.Now,
                        };
                        docRefSAP = ADO.DocumentADO.GetInstant().Create(docRefSAP, this.BuVO);
                        docRefSAPs.Add(docRefSAP);
                    }

                    //Create Doc Item
                    if (docItem == null)
                    {
                        docItem = new amt_DocumentItem();
                        docItem.Document_ID = docRefSAP.ID.Value;
                        docItemRefSAPs.Add(docItem);
                    }

                    //Update Doc Item
                    docItem.Document_ID = docRefSAP.ID.Value;
                    docItem.Code = sapDOItem.MATERIAL;
                    docItem.Batch = sapDOItem.BATCH;
                    docItem.Options = "DocItem=" + sapDOItem.DELIV_ITEM + "&DocType=" + sapDOItem.DLV_TYPE;
                    docItem.Quantity = newUnit.qty;
                    docItem.UnitType_ID = newUnit.unitType_ID;
                    docItem.BaseQuantity = newUnit.baseQty;
                    docItem.BaseUnitType_ID = newUnit.baseUnitType_ID;

                    ADO.DocumentADO.GetInstant().DocItemPut(docItem, BuVO);

                    flagCheckDocItems.Add(docItem.ID.Value);
                }

                docItemRefSAPs.FindAll(x => !flagCheckDocItems.Any(y => y == x.ID)).ForEach(di =>
                {
                    di.EventStatus = DocumentEventStatus.REMOVED;
                    ADO.DocumentADO.GetInstant().DocItemPut(di, BuVO);
                });

            }
            else if(sapDO.DOCSTATUS == "8")
            {
                docRefSAPs.ForEach(x => {
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                });                
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.S0001, "SAP ERROR : " + string.Join(',', sapDO.RETURN.Select(x => x.MESSAGE).ToArray()));
            }

            return docItemRefSAPs.FindAll(x => x.Status != EntityStatus.REMOVE);
        }

    }
}
