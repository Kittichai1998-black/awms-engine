using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ScanIssuedToPicking : BaseEngine<ScanIssuedToPicking.TReq, ScanIssuedToPicking.TRes>
    {

        public class TReq
        {
            public long docID;
            public string scanCode;
            public string baseCode;
            public int amount;
            public StorageObjectCriteria mapsto;
        }
        public class TRes
        {
            public StorageObjectCriteria mapsto;
            public StorageObjectCriteria mapstoConso;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            reqVO.scanCode = reqVO.scanCode == null ? null : reqVO.scanCode.ToUpper();
            reqVO.baseCode = reqVO.baseCode == null ? null : reqVO.baseCode.ToUpper();
            List<amt_DocumentItem> docItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", reqVO.docID, this.BuVO);
            amt_Document doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docID, this.BuVO);


            var mapSto = reqVO.mapsto != null ? reqVO.mapsto :
                ADO.StorageObjectADO.GetInstant()
                .Get(reqVO.scanCode, doc.Sou_Warehouse_ID, doc.Sou_AreaMaster_ID, false, true, this.BuVO);

            var firstMapSto = StorageObjectCriteria.GetMapStoLastFocus(mapSto);

            if (firstMapSto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการ " + reqVO.scanCode + " ในคลังสินค้า");
            if (firstMapSto.type == StorageObjectType.PACK)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการ " + reqVO.scanCode + " ในคลังสินค้า");
            if (firstMapSto.eventStatus == StorageObjectEventStatus.IDEL)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการ " + reqVO.scanCode + " ในคลังสินค้า");
            firstMapSto.isFocus = true;

            var baseConso = string.IsNullOrWhiteSpace(reqVO.baseCode) ? null :
                new CheckBaseCanUseInDocument().Execute(this.Logger, this.BuVO, new CheckBaseCanUseInDocument.TReq() { baseCode = reqVO.baseCode, docID = doc.ID.Value });

            if (!string.IsNullOrWhiteSpace(reqVO.baseCode) && baseConso == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Base Conso Code " + reqVO.baseCode + " ไม่ถูกต้อง");

            var mapStoTree = firstMapSto.ToTreeList();

            if (!docItems.Any(x => mapStoTree.Any(y => y.mstID == x.PackMaster_ID && y.type == StorageObjectType.PACK)))
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "รายการ " + reqVO.scanCode + " ไม่มีสินค้าตรงกับเอกสาร " + doc.Code);
            if (firstMapSto.eventStatus == StorageObjectEventStatus.PICKING || firstMapSto.eventStatus == StorageObjectEventStatus.PICKED)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "รายการ " + reqVO.scanCode + " ได้ถูก Picking แล้ว");
            if (firstMapSto.eventStatus == StorageObjectEventStatus.CONSOLIDATING || firstMapSto.eventStatus == StorageObjectEventStatus.CONSOLIDATED)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "รายการ " + reqVO.scanCode + " ได้ถูก Consolidate แล้ว");

            var diStos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("DocumentItem_ID",string.Join(',',docItems.Select(x=>x.ID.Value).ToArray()), SQLOperatorType.IN),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS, SQLConditionType.AND)
                },
                new SQLOrderByCriteria[] { }, null, null, this.BuVO);

            StorageObjectCriteria stoConso = null;
            //Pick ทั้ง Base
            if (firstMapSto.code == reqVO.scanCode && baseConso == null && firstMapSto.type == StorageObjectType.BASE &&
                docItems.TrueForAll(x =>
                        (x.Quantity - diStos.Count(y => y.DocumentItem_ID == x.ID)) >=//จำนวนสินค้าที่ยังไม่ pick
                        mapStoTree.Count(y => y.type == StorageObjectType.PACK && y.mstID == x.PackMaster_ID) //จำนวนสินค้าที่จะหยิบ
                        ) &&
               mapStoTree.Where(x => x.type == StorageObjectType.PACK)
                           .GroupBy(x => x.mstID)
                           .Select(x => x.Key.Value)
                           .ToList()
                           .TrueForAll(x => docItems.Any(y => y.PackMaster_ID == x))
               )
            {
                if (baseConso != null)
                {
                    stoConso = ADO.StorageObjectADO.GetInstant().GetFree(baseConso.Code, firstMapSto.warehouseID, firstMapSto.areaID,firstMapSto.batch,firstMapSto.lot, false, false, this.BuVO);
                    if (!stoConso.id.HasValue)
                        ADO.StorageObjectADO.GetInstant().Create(stoConso, firstMapSto.batch, firstMapSto.lot, this.BuVO);
                    firstMapSto.parentID = stoConso.id;
                }
                else
                {
                    stoConso = firstMapSto.Clone();
                    firstMapSto.parentID = null;
                }
                ADO.StorageObjectADO.GetInstant().PutV2(firstMapSto, this.BuVO);
                ADO.StorageObjectADO.GetInstant()
                    .UpdateStatusToChild(firstMapSto.id.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.CONSOLIDATED, this.BuVO);

                docItems.ForEach(x =>
                {
                    var mapStoToDocItem = mapStoTree.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.PackMaster_ID).Select(y => y.id.Value).ToList();
                    if (mapStoToDocItem.Count() > 0)
                        ADO.DocumentADO.GetInstant().MappingSTO(
                            x.ID.Value,
                            mapStoToDocItem,
                            this.BuVO);
                });
            }
            //Pick สินค้าใน Base
            else if (firstMapSto.code != reqVO.scanCode)
            {
                if (baseConso != null)
                {
                    stoConso = ADO.StorageObjectADO.GetInstant().Get(baseConso.Code, firstMapSto.warehouseID, firstMapSto.areaID, false, false, this.BuVO);
                    if (stoConso == null)
                        stoConso = ADO.StorageObjectADO.GetInstant().GetFree(baseConso.Code, firstMapSto.warehouseID, firstMapSto.areaID,firstMapSto.batch,firstMapSto.lot, false, false, this.BuVO);
                    if (!stoConso.id.HasValue)
                        ADO.StorageObjectADO.GetInstant().Create(stoConso, firstMapSto.batch, firstMapSto.lot, this.BuVO);
                }
                else if (reqVO.amount > 1)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนสินค้าที่ต้องการ Picking มากกว่า 1 ชิ้น จำเป็นต้องเลื่อกกล่อง Conso");

                var firstMapsto = mapStoTree.First(y => y.code == reqVO.scanCode);
                if (firstMapsto.type != StorageObjectType.PACK)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "เลือก Picking ได้เฉพาะสินค้าเท่านั้น");

                var di = docItems.First(x => x.PackMaster_ID == firstMapsto.mstID);
                if (reqVO.amount > (di.Quantity - diStos.Count(y => y.DocumentItem_ID == di.ID)))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนที่ Picking เกินประมาณสินค้าที่เบิก");


                List<StorageObjectCriteria> dociStoMapList = new List<StorageObjectCriteria>();
                StorageObjectCriteria _stoConso = null;

                var mapStoPickingList = mapStoTree
                    .Where(x => x.code == reqVO.scanCode &&
                        x.parentID == firstMapSto.id &&
                        x.parentType == firstMapSto.type &&
                        x.eventStatus != StorageObjectEventStatus.CONSOLIDATED);//เลือก Pick รายการที่อยู่ภายใต้กล่องที่เลือก 1LV

                if (mapStoPickingList.Count() < reqVO.amount)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนสินค้าที่ต้องการ Picking ไม่เพียงพอ");
                mapStoPickingList
                    .Take(reqVO.amount)
                    .ToList().ForEach(x =>
                    {
                        if (stoConso != null)
                        {
                            x.parentID = stoConso.id;
                            x.parentType = stoConso.type;
                        }
                        else
                            x.parentID = null;

                        if (stoConso == null)
                            _stoConso = x.Clone();

                        ADO.StorageObjectADO.GetInstant().PutV2(x, this.BuVO);
                        x.eventStatus = StorageObjectEventStatus.CONSOLIDATED;
                        dociStoMapList.Add(x);
                    });

                if (_stoConso != null && stoConso == null)
                    stoConso = _stoConso;
                ADO.StorageObjectADO.GetInstant()
                    .UpdateStatusToChild(stoConso.id.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.CONSOLIDATED, this.BuVO);

                dociStoMapList.GroupBy(x => new { mstID = x.mstID }).ToList().ForEach(x =>
                {
                    List<long> stoPackIDs = new List<long>();
                    dociStoMapList.FindAll(y => y.mstID == x.Key.mstID)
                    .ForEach(y => {
                        var v = y.ToTreeList().FindAll(z => z.type == StorageObjectType.PACK).Select(z => z.id.Value);
                        stoPackIDs.AddRange(v);
                    });
                    ADO.DocumentADO.GetInstant()
                        .MappingSTO(
                            docItems.First(y => y.PackMaster_ID == x.Key.mstID).ID.Value,
                            stoPackIDs,
                            this.BuVO);
                });
            }

            mapStoTree
                .Where(x => x.type == StorageObjectType.BASE && mapStoTree.Count(y => y.parentID == x.id.Value) == 0)
                .ToList()
                .ForEach(x =>
                {
                    x.eventStatus = StorageObjectEventStatus.REMOVED;
                    ADO.StorageObjectADO.GetInstant().PutV2(x, this.BuVO);
                });

            TRes res = new TRes() {
                mapsto = ADO.StorageObjectADO.GetInstant().Get(firstMapSto.id.Value, firstMapSto.type, false, true, this.BuVO),
                mapstoConso = stoConso == null ? null : ADO.StorageObjectADO.GetInstant().Get(stoConso.id.Value, stoConso.type, false, true, this.BuVO)
            };

            var diStos2 = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("DocumentItem_ID",string.Join(',',docItems.Select(x=>x.ID.Value).ToArray()), SQLOperatorType.IN),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS, SQLConditionType.AND)
                },
                new SQLOrderByCriteria[] { }, null, null, this.BuVO);
            if (docItems.TrueForAll(x => x.Quantity == diStos2.Count(y => y.DocumentItem_ID == x.ID)))
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);

            if (res.mapsto.eventStatus == StorageObjectEventStatus.CONSOLIDATING || res.mapsto.eventStatus == StorageObjectEventStatus.CONSOLIDATED ||
                res.mapsto.eventStatus == StorageObjectEventStatus.PICKING || res.mapsto.eventStatus == StorageObjectEventStatus.PICKED)
                res.mapsto = null;
            return res;
        }
    }
}
