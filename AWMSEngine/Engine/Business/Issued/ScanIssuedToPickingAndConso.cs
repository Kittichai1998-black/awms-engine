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
    public class ScanIssuedToPickingAndConso : BaseEngine<ScanIssuedToPickingAndConso.TReq, ScanIssuedToPickingAndConso.TRes>
    {
        public class TReq
        {
            public long docItemID;
            public string scanCode;
            public string baseCode;
            public int amount;
            public VirtualMapSTOActionType action;
            public StorageObjectCriteria mapsto;
        }
        public class TRes
        {
            public StorageObjectCriteria mapsto;
            public List<StorageObjectCriteria> mapstoConsos;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            amt_DocumentItem docItem = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(reqVO.docItemID, this.BuVO);
            amt_Document doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docItem.Document_ID, this.BuVO);

            var resMapsto = new ScanMapSTO().Execute(this.Logger, this.BuVO, new ScanMapSTO.TReqel()
            {
                action = reqVO.action,
                amount = reqVO.amount,
                areaID = doc.Sou_AreaMaster_ID,
                batch = doc.Batch,
                lot = doc.Lot,
                mode = VirtualMapSTOModeType.TRANSFER,
                scanCode = reqVO.scanCode,
                options = null,
                warehouseID = doc.Sou_Warehouse_ID,
                mapsto = reqVO.mapsto.Clone()
            });

            TRes res = new TRes() { mapsto = resMapsto };
            if (reqVO.mapsto != null && reqVO.action == VirtualMapSTOActionType.REMOVE)
            {
                /*var lisResSTO = TreeSTOtoListSTO(resMapsto);
                var lisRmSTO = TreeSTOtoListSTO(reqVO.mapsto);

                lisRmSTO.RemoveAll(x => lisResSTO.Any(y => y.id == x.id));*/
                var stoConsos = ListSTORemoved(reqVO.mapsto, resMapsto);
                List<StorageObjectCriteria> packConsos = new List<StorageObjectCriteria>();
                stoConsos.ForEach(x => { var y = x.ToTreeList().FindAll(z => z.type == StorageObjectType.PACK); packConsos.AddRange(y); });

                var _exceptionPackCode = packConsos.FirstOrDefault(x => x.mstID != docItem.PackMaster_ID);
                if (_exceptionPackCode != null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "สินค้าที่เลือกไม่ตรงกับเอกสาร Product Code:" + _exceptionPackCode.code);

                var dociStos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                    new KeyValuePair<string, object>[]{
                        new KeyValuePair<string, object>("DocumentItem_ID",docItem.ID.Value),
                        new KeyValuePair<string, object>("Status",EntityStatus.ACTIVE),
                        }, this.BuVO);
                if (reqVO.amount > docItem.Quantity - dociStos.Count())
                    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนที่ Picking มากเกินจำนวนคนเหลือจาก Issued Document");


                //Picking and Conso
                if (string.IsNullOrWhiteSpace(reqVO.baseCode))
                {
                    if(stoConsos.Any(x=>x.type == StorageObjectType.PACK))
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สินค้ารายการที่เลือก จำเป็นต้องเลือก กล่อง/ถาด/พาเลท เพื่อใช้ Consolidate");

                    ADO.DocumentADO.GetInstant().MappingSTO(docItem.ID.Value, packConsos.Select(x => x.id.Value).ToList(), this.BuVO);
                    res.mapstoConsos = stoConsos;
                }
                else
                {
                    StorageObjectCriteria bstoConso = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, doc.Sou_Warehouse_ID, doc.Sou_AreaMaster_ID, false, true, this.BuVO);
                    if(bstoConso == null)
                    {
                        bstoConso = ADO.StorageObjectADO.GetInstant().GetFree(reqVO.baseCode, doc.Sou_Warehouse_ID, doc.Sou_AreaMaster_ID, false, true, this.BuVO);
                        if (bstoConso == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V2001, "รหัสกล่อง/ถาด/พาเลท ไม่ถูกต้อง");
                    }

                    bstoConso.mapstos.AddRange(stoConsos);
                    foreach(var ms in stoConsos)
                    {
                        ms.parentID = bstoConso.id;
                        ADO.StorageObjectADO.GetInstant().Update(ms, ms.areaID, this.BuVO);
                    }
                    ADO.DocumentADO.GetInstant().MappingSTO(docItem.ID.Value, packConsos.Select(x => x.id.Value).ToList(), this.BuVO);
                    res.mapstoConsos = new List<StorageObjectCriteria>() { bstoConso };
                }

                //Base ไม่มีสินค้าอยู่ภายใน ให้ลบทิ้งจากระบบ
                this.DoneBaseNotChilds(res.mapsto);
                if (res.mapsto.eventStatus == StorageObjectEventStatus.REMOVED)
                    res.mapsto = null;
            }

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
