using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class CreateWorkedSTCDocument : BaseEngine<CreateWorkedSTCDocument.TDocReq, amt_Document>
    {

        public class TDocReq
        {
            public long rootStoID;
            public string remark;
            public List<AdjustItem> adjustItems;
            public class AdjustItem
            {
                public long? baseStoID;
                public string packStoCode;
                public int packQty;
            }
        }

        protected override amt_Document ExecuteEngine(TDocReq reqVO)
        {
            var stomap = ADO.StorageObjectADO.GetInstant().Get(reqVO.rootStoID, StorageObjectType.BASE, false, true, this.BuVO);

            var newDoc = this.NewDocument(reqVO, stomap);
            newDoc.DocumentItems = this.NewDocumentItem(reqVO, newDoc, stomap);
            var res = ADO.DocumentADO.GetInstant().Create(newDoc, this.BuVO);

            return res;
        }

        private amt_Document NewDocument(TDocReq reqVO, StorageObjectCriteria stomap)
        {
            var souWarehouseModel = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == stomap.warehouseID);

            if (souWarehouseModel == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "souWarehouse ไม่ถูกต้อง");

            var souBranchModel = this.StaticValue.Branchs.FirstOrDefault(x => x.ID == souWarehouseModel.Branch_ID);

            amt_Document newDoc = new amt_Document()
            {
                RefID = "(InApp)",

                Sou_Warehouse_ID = souWarehouseModel.ID,
                Sou_Branch_ID = souBranchModel.ID,

                ActionTime = DateTime.Now,
                DocumentDate = DateTime.Now,
                DocumentType_ID = DocumentTypeID.STOCK_CORRECTIONS,

                Remark = reqVO.remark,

                EventStatus = DocumentEventStatus.CLOSED,

                DocumentItems = new List<amt_DocumentItem>()
            };
            return newDoc;
        }

        private List<amt_DocumentItem> NewDocumentItem(TDocReq reqVO ,amt_Document newDoc, StorageObjectCriteria stomap)
        {
            List<amt_DocumentItem> newDocItems = new List<amt_DocumentItem>();
            //สร้าง Item Document สำหรับ loading
            var stomapList = stomap.ToTreeList();
            foreach (var adj in reqVO.adjustItems)
            {
                List<StorageObjectCriteria> packInSto = stomapList
                    .Where(x => x.parentID == adj.baseStoID && x.code == adj.packStoCode)
                    .OrderByDescending(x => x.id)
                    .ToList();
                if (packInSto.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบรายการที่ต้องการแก้ไข");

                int adjQty = adj.packQty - packInSto.Count();//จำนวนที่ต้องการปรับ
                var packAdjInfo = packInSto.FirstOrDefault();
                List<StorageObjectCriteria> packAdjs = new List<StorageObjectCriteria>();
                if (adjQty > 0)
                {

                    for (int i = 0; i < adjQty; i++)
                    {
                        var p = packAdjInfo.Clone();
                        p.id = null;
                        ADO.StorageObjectADO.GetInstant().PutV2(p, this.BuVO);
                        packAdjs.Add(p);
                    }
                    packInSto.AddRange(packAdjs);
                }
                else if (adjQty < 0)
                {
                    if (packInSto.Count() < Math.Abs(adjQty))
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนสินค้าไม่สามารถติดลบได้");

                    packInSto.RemoveRange(Math.Abs(adjQty), packInSto.Count()- Math.Abs(adjQty));
                    packInSto.ForEach(x => {
                        x.eventStatus = StorageObjectEventStatus.ADJUSTED;
                        ADO.StorageObjectADO.GetInstant().PutV2(x, this.BuVO);
                    });
                    packAdjs = packInSto;
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "คุณยังไม่ได้ปรับจำนวนสินค้า");
                }

                
                
                var packMst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(packAdjInfo.mstID, this.BuVO);
                var newDocItem = new amt_DocumentItem()
                {
                    Code = packAdjInfo.code,
                    PackMaster_ID = packAdjInfo.mstID,
                    SKUMaster_ID = packMst.SKUMaster_ID,
                    Quantity = adj.packQty,
                    StorageObjectIDs = packAdjs.Select(x => x.id.Value).ToList(),
                    EventStatus = DocumentEventStatus.CLOSED
                };
                newDocItems.Add(newDocItem);

            }

            return newDocItems;
        }
    }
}
