using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class MappingDistoAndDocumentItem : BaseEngine<MappingDistoAndDocumentItem.TReq, MappingDistoAndDocumentItem.TRes>
    {
        public class TReq
        {
            public long packID;
            public DocumentProcessTypeID docProcessType;
        }

        public class TRes
        {
            public StorageObjectCriteria sto;
            public List<Documents> documents;

            public class Documents
            {
                public long? GR_ID;
                public string GR_Code;
                public long? PA_ID;
                public string PA_Code; 
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var chkCreatePA = StaticValue.Configs.Find(x => x.DataKey == "USE_AUTO_CREATE_GR").DataValue;
            var chkCreateGR = StaticValue.Configs.Find(x => x.DataKey == "USE_AUTO_CREATE_PA").DataValue;

            var psto = DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("ID", reqVO.packID, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            if (psto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND);

            var docItems = DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("RefID", psto.RefID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("ParentDocumentItem_ID", "", SQLOperatorType.ISNULL)
            }, this.BuVO);

            var distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("DocumentItem_ID", string.Join(',', docItems.Select(x=> x.ID).ToArray()), SQLOperatorType.IN),
                new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.NOTEQUALS)
            }, this.BuVO).OrderByDescending(x => x.CreateTime).ToList();

            var newBaseQty = psto.BaseQuantity - distos.FindAll(disto => disto.Sou_StorageObject_ID == psto.ID).Sum(x => x.BaseQuantity).Value;
            var newQty = psto.Quantity - distos.FindAll(disto => disto.Sou_StorageObject_ID == psto.ID).Sum(x => x.Quantity).Value;

            if (docItems.Count > 0)
            {
                foreach (var docItem in docItems)
                {
                    var doc = DocumentADO.GetInstant().GetDocumentAndDocItems(docItem.Document_ID, this.BuVO);

                    if (doc.DocumentProcessType_ID != reqVO.docProcessType)
                        continue;

                    var parentDoc = DocumentADO.GetInstant().GetDocumentAndDocItems(doc.ParentDocument_ID.Value, this.BuVO);
                    var disto = distos.Find(x => x.DocumentItem_ID == docItem.ID && x.Sou_StorageObject_ID == psto.ID);
                    var remainBaseRecv = docItem.BaseQuantity.Value - distos.FindAll(x => x.DocumentItem_ID == docItem.ID).Sum(x => x.BaseQuantity).Value;
                    var remainRecv = docItem.Quantity.Value - distos.FindAll(x => x.DocumentItem_ID == docItem.ID).Sum(x => x.Quantity).Value;

                    if (remainRecv == 0)
                        continue;

                    if (disto != null)
                    {
                        if (remainBaseRecv > 0 && newBaseQty > 0)
                        {
                            if (remainBaseRecv > newBaseQty)
                            {
                                disto.BaseQuantity = disto.BaseQuantity + newQty;
                                disto.Quantity = disto.Quantity + newBaseQty;
                                DistoADO.GetInstant().Update(disto, this.BuVO);
                                newBaseQty = 0;
                                newQty = 0;
                            }
                            else if (remainBaseRecv < newBaseQty)
                            {
                                disto.BaseQuantity = disto.BaseQuantity + remainBaseRecv;
                                disto.Quantity = disto.Quantity + remainBaseRecv;
                                DistoADO.GetInstant().Update(disto, this.BuVO);
                                newBaseQty = newBaseQty - remainBaseRecv;
                                newQty = newQty - remainRecv;
                            }
                        }
                        else if (newBaseQty < 0)
                        {
                            if (psto.EventStatus == StorageObjectEventStatus.REMOVED || disto.BaseQuantity.Value + newBaseQty <= 0)
                            {
                                // 50 + (-100)
                                if (disto.BaseQuantity + newBaseQty <= 0)
                                    newBaseQty = disto.BaseQuantity.Value + newBaseQty;

                                disto.BaseQuantity = 0;
                                disto.Quantity = 0;
                                disto.Status = EntityStatus.REMOVE;
                                DistoADO.GetInstant().Update(disto, this.BuVO);

                                newBaseQty = 0;

                                if (ObjectUtil.QryStrGetValue(doc.Options, OptionVOConst.OPT_MAPPING_AUTO_DOC) == "true")
                                {
                                    var _docItem = doc.DocumentItems.Find(x => x.ID == docItem.ID);
                                    _docItem.EventStatus = DocumentEventStatus.REMOVED;
                                    _docItem.Status = EntityStatus.REMOVE;

                                    DocumentADO.GetInstant().UpdateItemEventStatus(_docItem.ID.Value, DocumentEventStatus.REMOVED, BuVO);

                                    if (doc.DocumentItems.TrueForAll(x => x.Status == EntityStatus.REMOVE))
                                    {
                                        doc.EventStatus = DocumentEventStatus.REMOVED;
                                        doc.Status = EntityStatus.REMOVE;
                                        DocumentADO.GetInstant().UpdateEventStatus(doc.ID.Value, DocumentEventStatus.REMOVED, BuVO);
                                    }

                                    if (ObjectUtil.QryStrGetValue(parentDoc.Options, OptionVOConst.OPT_MAPPING_AUTO_DOC) == "true")
                                    {
                                        var parentDocItem = parentDoc.DocumentItems.Find(x => x.ID == docItem.ParentDocumentItem_ID);
                                        parentDocItem.EventStatus = DocumentEventStatus.REMOVED;
                                        parentDocItem.Status = EntityStatus.REMOVE;
                                        DocumentADO.GetInstant().UpdateItemEventStatus(parentDocItem.ID.Value, DocumentEventStatus.REMOVED, BuVO);

                                        if (parentDoc.DocumentItems.TrueForAll(x => x.Status == EntityStatus.REMOVE))
                                        {
                                            parentDoc.EventStatus = DocumentEventStatus.REMOVED;
                                            parentDoc.Status = EntityStatus.REMOVE;
                                            DocumentADO.GetInstant().UpdateEventStatus(parentDoc.ID.Value, DocumentEventStatus.REMOVED, BuVO);
                                        }
                                    }
                                }
                            }
                            else if (disto.BaseQuantity + newBaseQty > 0)
                            {
                                disto.BaseQuantity += newBaseQty;
                                DistoADO.GetInstant().Update(disto, this.BuVO);
                                newBaseQty = 0;
                            }
                        }
                    }
                    else
                    {
                        disto = new amt_DocumentItemStorageObject()
                        {
                            ID = null,
                            BaseQuantity = remainBaseRecv - newBaseQty,
                            BaseUnitType_ID = psto.BaseUnitType_ID,
                            Quantity = remainRecv - newQty,
                            UnitType_ID = psto.UnitType_ID,
                            Sou_StorageObject_ID = psto.ID.Value,
                            DocumentItem_ID = docItem.ID.Value,
                            DocumentType_ID = doc.DocumentType_ID,
                            Status = EntityStatus.INACTIVE
                        };

                        DistoADO.GetInstant().Insert(disto, this.BuVO);
                        newBaseQty = remainBaseRecv - newBaseQty;
                        newQty = remainRecv - newQty;
                    }

                };
            }
            else
            {
                if (chkCreatePA == "true")
                {

                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND);
                }
            }


            if (newBaseQty != 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_OVER_DOC);

            return null;
        }
    }
}
