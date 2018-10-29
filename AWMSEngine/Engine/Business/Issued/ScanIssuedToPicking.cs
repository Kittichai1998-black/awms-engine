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
            List<amt_DocumentItem> docItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID",reqVO.docID, this.BuVO);
            amt_Document doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docID, this.BuVO);

            var mapSto = reqVO.mapsto != null ? reqVO.mapsto : 
                ADO.StorageObjectADO.GetInstant()
                .Get(reqVO.scanCode, doc.Sou_Warehouse_ID, doc.Sou_AreaMaster_ID, false, true, this.BuVO);
            mapSto.isFocus = true;

            var baseConso = string.IsNullOrWhiteSpace(reqVO.baseCode) ? null :
                new CheckBSTOCanUseInDocument().Execute(this.Logger, this.BuVO, new CheckBSTOCanUseInDocument.TReq() { baseCode = reqVO.baseCode, docID = doc.ID.Value });

            if (!string.IsNullOrWhiteSpace(reqVO.baseCode) && baseConso == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Base Conso Code " + reqVO.baseCode + " ไม่ถูกต้อง");

            var mapStoTree = mapSto.ToTreeList();

            if (mapSto.eventStatus == StorageObjectEventStatus.IDEL)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการ " + reqVO.scanCode + " ในคลังสินค้า");
            if (mapStoTree.Any(x => x.code == reqVO.scanCode && x.type == StorageObjectType.PACK))
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการ " + reqVO.scanCode + " ในคลังสินค้า");
            if (mapSto.eventStatus == StorageObjectEventStatus.PICKING || mapSto.eventStatus == StorageObjectEventStatus.PICKED)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "รายการ " + reqVO.scanCode + " ได้ถูก Picking แล้ว");
            if (mapSto.eventStatus == StorageObjectEventStatus.CONSOLIDATING || mapSto.eventStatus == StorageObjectEventStatus.CONSOLIDATED)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "รายการ " + reqVO.scanCode + " ได้ถูก Consolidate แล้ว");

            var diStos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("DocumentItem_ID",string.Join(',',docItems.Select(x=>x.ID.Value).ToArray()), SQLOperatorType.IN),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS, SQLConditionType.AND)
                },
                new SQLOrderByCriteria[] { }, null, null, this.BuVO);

            StorageObjectCriteria stoConso = null;
            //Pick ทั้ง Base
            if (mapSto.code == reqVO.scanCode && baseConso == null &&
                docItems.TrueForAll(x =>
                        (x.Quantity - diStos.Count(y => y.DocumentItem_ID == x.ID)) <=//จำนวนสินค้าที่ยังไม่ pick
                        mapStoTree.Count(y => y.type == StorageObjectType.PACK && y.id == x.PackMaster_ID) //จำนวนสินค้าที่จะหยิบ
                        )
               )
            {
                if(baseConso != null)
                {
                    stoConso = ADO.StorageObjectADO.GetInstant().GetFree(baseConso.Code, doc.Sou_Warehouse_ID, doc.Sou_AreaMaster_ID, false, false, this.BuVO);
                    mapSto.parentID = stoConso.id;
                }
                else
                {
                    stoConso = mapSto.Clone();
                    mapSto.parentID = null;
                }
                ADO.StorageObjectADO.GetInstant().PutV2(mapSto, this.BuVO);
                ADO.StorageObjectADO.GetInstant()
                    .UpdateStatusToChild(mapSto.id.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.CONSOLIDATED, null, this.BuVO);

                docItems.ForEach(x =>
                {
                    ADO.DocumentADO.GetInstant().MappingSTO(
                        x.ID.Value,
                        mapStoTree.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.PackMaster_ID).Select(y => y.id.Value).ToList(),
                        this.BuVO);
                });
            }
            //Pick สินค้าใน Base
            else if(mapSto.code != reqVO.scanCode)
            {
                if (baseConso != null)
                {
                    stoConso = ADO.StorageObjectADO.GetInstant().GetFree(baseConso.Code, doc.Sou_Warehouse_ID, doc.Sou_AreaMaster_ID, false, false, this.BuVO);
                }
                else if (reqVO.amount > 1)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนสินค้าที่ต้องการ Picking มากกว่า 1 ชิ้น จำเป็นต้องเลื่อกกล่อง Conso");

                if (mapStoTree.Count(x => x.code == reqVO.scanCode) > reqVO.amount)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนสินค้าที่ต้องการ Picking ไม่เพียงพอ");

                List<StorageObjectCriteria> dociStoMapList = new List<StorageObjectCriteria>(); 
                StorageObjectCriteria _stoConso = null;
                mapStoTree
                    .Where(x => x.code == reqVO.scanCode && x.parentID != null && x.parentID != stoConso.id)
                    .Take(reqVO.amount)
                    .ToList().ForEach(x=>
                    {
                        if(stoConso != null)
                            x.parentID = stoConso.id;

                        if (stoConso == null)
                            _stoConso = x.Clone();

                        ADO.StorageObjectADO.GetInstant().PutV2(x, this.BuVO);

                        dociStoMapList.AddRange(x.ToTreeList().Where(y => y.type == StorageObjectType.PACK));
                    });

                if (_stoConso != null)
                    stoConso = _stoConso;
                ADO.StorageObjectADO.GetInstant()
                    .UpdateStatusToChild(stoConso.id.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.CONSOLIDATED, null, this.BuVO);

                dociStoMapList.GroupBy(x => new { id = x.id, mstID = x.mstID }).ToList().ForEach(x =>
                {
                    ADO.DocumentADO.GetInstant()
                        .MappingSTO(
                            docItems.First(y => y.PackMaster_ID == x.Key.mstID).ID.Value,
                            dociStoMapList.FindAll(y => y.mstID == x.Key.mstID).Select(y => y.id.Value).ToList(),
                            this.BuVO);
                });
            }

            TRes res = new TRes() {
                mapsto = ADO.StorageObjectADO.GetInstant().Get(mapSto.id.Value, mapSto.type, false, true, this.BuVO),
                mapstoConso = stoConso == null ? null : ADO.StorageObjectADO.GetInstant().Get(stoConso.id.Value, stoConso.type, false, true, this.BuVO)
            };

            return res;
        }

        public void DoneBaseNotChilds(StorageObjectCriteria mapsto)
        {
            mapsto.mapstos.ForEach(x => this.DoneBaseNotChilds(x));
            mapsto.mapstos.RemoveAll(x => x.eventStatus == StorageObjectEventStatus.REMOVED);

            if(mapsto.type != StorageObjectType.PACK && mapsto.mapstos.Count() == 0)
            {
                mapsto.eventStatus = StorageObjectEventStatus.REMOVED;
                ADO.DataADO.GetInstant()
                    .UpdateByID<amt_StorageObject>(mapsto.id.Value,this.BuVO,
                        new KeyValuePair<string, object>("Status", EntityStatus.REMOVE),
                        new KeyValuePair<string, object>("EventStatus", StorageObjectEventStatus.REMOVED));
            }
        }

        public List<StorageObjectCriteria> TreeSTOtoListSTO(StorageObjectCriteria mapsto)
        {
            List<StorageObjectCriteria> res = new List<StorageObjectCriteria>();
            if (!mapsto.parentID.HasValue)
                res.Add(mapsto);
            res.AddRange(mapsto.mapstos);
            mapsto.mapstos.ForEach(x => { res.AddRange(TreeSTOtoListSTO(x)); });
            return res;
        }

        public List<StorageObjectCriteria> ListSTORemoved(StorageObjectCriteria oldMapsto, StorageObjectCriteria newMapsto)
        {
            if (oldMapsto.id != newMapsto.id)
                return new List<StorageObjectCriteria>() { oldMapsto };

            List<StorageObjectCriteria> res = new List<StorageObjectCriteria>();
            foreach(var oldMS in oldMapsto.mapstos)
            {
                var newMS = newMapsto.mapstos.FirstOrDefault(x => x.id == oldMS.id);
                if (newMS != null)
                {
                    res.AddRange(ListSTORemoved(oldMS, newMS));
                }
                else
                {
                    res.Add(oldMS);
                }
            }

            return res;

        }
        private List<StorageObjectCriteria> ListSTOPack(StorageObjectCriteria mapsto)
        {
            List<StorageObjectCriteria> res = new List<StorageObjectCriteria>();
            if (!mapsto.parentID.HasValue && mapsto.type == StorageObjectType.PACK)
                res.Add(mapsto);
            res.AddRange(mapsto.mapstos);
            mapsto.mapstos.ForEach(x => { res.AddRange(TreeSTOtoListSTO(x)); });
            return res;
        }

        private void FirstScan()
        {

        }
        private void SecondScan()
        {

        }
    }
}
