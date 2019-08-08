using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectTAP.Engine.Business.Crossdock
{
    public class GetIssueCrossdockDoc : BaseEngine<GetIssueCrossdockDoc.TReq, GetIssueCrossdockDoc.TRes>
    {
        public class TReq
        {
            public string packCode;
            public decimal quantity;
            public string lot;
            public DateTime productDate;
            public string options;
        }

        public class TRes
        {
            public List<Document> docs;
            public class Document
            {
                public amt_DocumentItemsExtend docItem;
                public DocItemIDs DocumentID;
            }

            public class amt_DocumentItemsExtend : amt_DocumentItem
            {
                public string UnitCode;
                public string BaseUnitCode;
                public decimal Picked;
                public string DocumentCode;
            }

            public class DocItemIDs 
            {
                public long grDocID;
                public long grDocItemID;
                public long giDocID;
                public long giDocItemID;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.packCode, this.BuVO);

            if (pack == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pack " + reqVO.packCode + " Not Found");

            //Find All DocItem From Pack Detail
            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("EventStatus", "10,11", SQLOperatorType.IN),
                new SQLConditionCriteria("PackMaster_ID", pack.ID.Value, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("BaseQuantity", reqVO.quantity, SQLOperatorType.MORE_EQUALS),
                new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, this.BuVO);

            if (!string.IsNullOrWhiteSpace(reqVO.lot))
                docItems = docItems.Where(x => x.Lot == reqVO.lot).ToList();

            if (docItems == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Crossdock Document Not Found");

            //Get Document
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO);
            //Filter to Get GR
            var crosDocs = docs.Where(x => x.MovementType_ID == MovementType.FG_CROSSDOCK_CUS).ToList();
            //Get GI
            var parentDocsID = crosDocs.Select(x => x.ParentDocument_ID.Value).Distinct().ToList();
            //Get List GI
            //var docsList = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(parentDocsID, this.BuVO);

            var res = new TRes();
            var res2 = new List<TRes.Document>();

            //Create List Doc
            crosDocs.ForEach(doc =>
            {
                var getDocItemGI = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(doc.ParentDocument_ID.Value, this.BuVO);

                doc.DocumentItems.ForEach(docItem =>
                {
                    var getdocItemGI = getDocItemGI.Find(docItemGI => docItem.ParentDocumentItem_ID == docItemGI.ID);

                    decimal? sumPicked = 0;
                    if(docItem.DocItemStos != null)
                        sumPicked = docItem.DocItemStos.FindAll(x=>x.Status == EntityStatus.ACTIVE).Sum(x => x.BaseQuantity);

                    if(sumPicked.Value + reqVO.quantity > docItem.BaseQuantity)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Quantity more than Cross Dock Document");

                    var crosDocItemGR = new TRes.amt_DocumentItemsExtend()
                    {
                        ID = docItem.ID,
                        DocumentCode = doc.Code,
                        ParentDocumentItem_ID = docItem.ParentDocumentItem_ID,
                        Code = docItem.Code,
                        Quantity = docItem.Quantity,
                        BaseQuantity = docItem.BaseQuantity,
                        Picked = sumPicked.Value,
                        EventStatus = docItem.EventStatus,
                        Status = docItem.Status,
                        Lot = docItem.Lot,
                        OrderNo = docItem.OrderNo,
                        Batch = docItem.Batch,
                        Document_ID = docItem.Document_ID,
                        UnitType_ID = docItem.UnitType_ID,
                        BaseUnitType_ID = docItem.BaseUnitType_ID,
                        BaseUnitCode = StaticValue.UnitTypes.FirstOrDefault(xx => xx.ID == docItem.UnitType_ID.Value).Code,
                        UnitCode = StaticValue.UnitTypes.FirstOrDefault(xx => xx.ID == docItem.BaseUnitType_ID.Value).Code,
                    };

                    var resData = new TRes.Document()
                    {
                        docItem = crosDocItemGR,
                        DocumentID = new TRes.DocItemIDs()
                        {
                            giDocID = getdocItemGI.Document_ID,
                            giDocItemID = getdocItemGI.ID.Value,
                            grDocID = crosDocItemGR.Document_ID,
                            grDocItemID = crosDocItemGR.ID.Value,
                        }
                    };

                    res2.Add(resData);
                });

                //x.DocumentItems = x.DocumentItems.Where(doci => doci.PackMaster_ID == pack.ID).ToList();

                //var crossDockDoc = crosDocs.Where(y => y.ParentDocument_ID == x.ID).ToList();

                //var crosDocNew = new TRes.amt_DocumentExtend();

                //crossDockDoc.ForEach(crosDoc =>
                //{
                //    var crosDocItemNew = new List<TRes.amt_DocumentItemsExtend>();

                //    crosDoc.DocumentItems.ForEach(docItem =>
                //    {
                //        crosDocItemNew.Add(new TRes.amt_DocumentItemsExtend()
                //        {
                //            ID = docItem.ID,
                //            ParentDocumentItem_ID = docItem.ParentDocumentItem_ID,
                //            Code = docItem.Code,
                //            Quantity = docItem.Quantity,
                //            BaseQuantity = docItem.BaseQuantity,
                //            EventStatus = docItem.EventStatus,
                //            Status = docItem.Status,
                //            Lot = docItem.Lot,
                //            OrderNo = docItem.OrderNo,
                //            Batch = docItem.Batch,
                //            Document_ID = docItem.Document_ID,
                //            UnitType_ID = docItem.UnitType_ID,
                //            BaseUnitType_ID = docItem.BaseUnitType_ID,
                //            BaseUnitCode = StaticValue.UnitTypes.FirstOrDefault(xx => xx.ID == docItem.UnitType_ID.Value).Code,
                //            UnitCode = StaticValue.UnitTypes.FirstOrDefault(xx => xx.ID == docItem.BaseUnitType_ID.Value).Code,
                //        });
                //    });

                //    crosDocNew.ID = crosDoc.ID;
                //    crosDocNew.Code = crosDoc.Code;
                //    crosDocNew.EventStatus = crosDoc.EventStatus;
                //    crosDocNew.Status = crosDoc.Status;
                //    crosDocNew.DocumentType_ID = crosDoc.DocumentType_ID;
                //    crosDocNew.MovementType_ID = crosDoc.MovementType_ID;
                //    crosDocNew.DocumentDate = crosDoc.DocumentDate;
                //    crosDocNew.DocumentItems = crosDocItemNew;
                //    crosDocNew.ParentDocument_ID = crosDoc.ParentDocument_ID;
                //});

                //var resData = new TRes.Document()
                //{
                //    doc = crosDocNew,
                //    GRDocument = crosDocs.Where(y => y.ParentDocument_ID == x.ID).ToList()
                //};

                //res2.Add(resData);
            });

            res.docs = res2;
            return res;
        }
    }
}
