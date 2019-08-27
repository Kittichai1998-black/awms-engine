using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.Engine.Business.Issued
{
    public class ProcessQueueCrossDock : IProjectEngine<List<amt_Document>, List<amt_Document>>
    {

        public List<amt_Document> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<amt_Document> reqVO)
        {
            var resDoc = new List<amt_Document>();
            reqVO.ForEach(reqDoc =>
            {
                var crossdockItem = reqDoc.DocumentItems.Where(docitem => docitem.DocItemStos.Any(disto => disto.BaseQuantity < docitem.BaseQuantity)).ToList();

                if(crossdockItem.Count > 0)
                {
                    amt_Document doc = new amt_Document()
                    {
                        ID = null,
                        Code = null,
                        ParentDocument_ID = reqDoc.ID.Value,
                        Lot = reqDoc.Lot,
                        Batch = reqDoc.Batch,
                        For_Customer_ID = reqDoc.For_Customer_ID,
                        Sou_Customer_ID = null,
                        Sou_Supplier_ID = null,
                        Sou_Branch_ID = reqDoc.Sou_Warehouse_ID,
                        Sou_Warehouse_ID = reqDoc.Sou_Warehouse_ID,
                        Sou_AreaMaster_ID = null,
                        

                        Des_Customer_ID = null,
                        Des_Supplier_ID = null,
                        Des_Branch_ID = reqDoc.Des_Warehouse_ID,
                        Des_Warehouse_ID = reqDoc.Des_Warehouse_ID,
                        Des_AreaMaster_ID = null,
                        DocumentDate = DateTime.Now,
                        ActionTime = null,
                        MovementType_ID = MovementType.FG_CROSSDOCK_CUS,
                        RefID = null,
                        Ref1 = null,
                        Ref2 = null,

                        DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                        EventStatus = DocumentEventStatus.WORKING,

                        Remark = null,
                        Transport_ID = null,

                        DocumentItems = new List<amt_DocumentItem>(),

                    };
                    crossdockItem.ForEach(item =>
                    {
                        var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(item.Code, buVO);
                        var sumQtyDisto = item.DocItemStos.Sum(disto => disto.BaseQuantity);
                        if (sumQtyDisto < item.BaseQuantity)
                        {
                            doc.DocumentItems.Add(new amt_DocumentItem()
                            {
                                ID = null,
                                Code = item.Code,
                                ParentDocumentItem_ID = item.ID,
                                SKUMaster_ID = pack.SKUMaster_ID,
                                PackMaster_ID = pack.ID,

                                Quantity = item.BaseQuantity - sumQtyDisto,
                                UnitType_ID = item.UnitType_ID,
                                BaseQuantity = item.BaseQuantity - sumQtyDisto,
                                BaseUnitType_ID = item.BaseUnitType_ID,

                                
                                OrderNo = item.OrderNo,
                                Batch = item.Batch,
                                Lot = item.Lot,

                                Options = item.Options,
                                ExpireDate = item.ExpireDate,
                                ProductionDate = item.ProductionDate,
                                Ref1 = item.Ref1,
                                Ref2 = item.Ref2,
                                RefID = item.RefID,

                                EventStatus = DocumentEventStatus.WORKING,

                            });
                        }
                    });

                    var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO).ID;

                    resDoc.Add(AWMSEngine.ADO.DocumentADO.GetInstant().Get(docID.Value, buVO));
                }
            });

            return resDoc;
        }
    }
}
