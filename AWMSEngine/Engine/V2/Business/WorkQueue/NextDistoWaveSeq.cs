using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class NextDistoWaveSeq : BaseEngine<NextDistoWaveSeq.TReq, amt_DocumentItemStorageObject>
    {
        public class TReq
        {
            public long DesAreaID;
            public long? DesLocationID;
            //public long CurrentBaseStoID;
            public List<long> CurrentDistoIDs;
            //public decimal NextDistoBaseQty;
        }

        protected override amt_DocumentItemStorageObject ExecuteEngine(TReq reqVO)
        {
            List<amt_DocumentItemStorageObject> currentDistos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria("ID", string.Join(',', reqVO.CurrentDistoIDs.ToArray()), SQLOperatorType.IN), this.BuVO);
            if (currentDistos.Any(x => x.Status != EntityStatus.ACTIVE))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สถานะสินค้ายังไม่สิ้นสุด");
            }
            if (currentDistos.Any(x => !x.Sou_WaveSeq_ID.HasValue))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่มีการใช้งาน Wave");
            }

            List<amt_DocumentItemStorageObject> nextDistos = new List<amt_DocumentItemStorageObject>();
            foreach(var currentDisto in currentDistos)
                //.GroupBy(x=>new { souWaveID = x.Sou_WaveSeq_ID, desWaveID = x.Des_WaveSeq_ID })
                //.Select(x=>new amt_DocumentItemStorageObject() { Sou_WaveSeq_ID = x.Key.souWaveID, Des_WaveSeq_ID =x.Key.desWaveID }))
            {
                amt_Wave wave = ADO.WaveADO.GetInstant().GetWaveAndSeq_byWaveSeq(currentDisto.Sou_WaveSeq_ID.Value, this.BuVO);
                amt_WaveSeq nextWaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.ID == currentDisto.Des_WaveSeq_ID);
                if (nextWaveSeq == null)
                {
                    //ตรวจสอบการทำงานทั้ง Wave เพื่อ Closed Document
                }
                else
                {
                    //next Disto (Qty is null)
                    var disto = this.NextDisto(wave, nextWaveSeq, currentDisto, reqVO);
                    nextDistos.Add(disto);
                }
            }


            return null;
        }
        public amt_DocumentItemStorageObject NextDisto(amt_Wave wave, amt_WaveSeq nextWaveSeq, amt_DocumentItemStorageObject currentDisto, TReq reqVO)
        {
            amt_WaveSeq next2WaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.Seq == nextWaveSeq.Seq + 1);
            amt_DocumentItemStorageObject newNextDisto = new amt_DocumentItemStorageObject()
            {
                ID = null,
                Sou_WaveSeq_ID = currentDisto.Des_WaveSeq_ID,
                Sou_StorageObject_ID = currentDisto.Des_StorageObject_ID.Value,
                Des_WaveSeq_ID = next2WaveSeq == null ? null : next2WaveSeq.ID,
                Des_StorageObject_ID = null,
                WorkQueue_ID = null,
                Quantity = null,//currentDisto.Quantity * (reqVO.NextDistoBaseQty / currentDisto.BaseQuantity),
                UnitType_ID = currentDisto.UnitType_ID,
                BaseQuantity = null,//reqVO.NextDistoBaseQty,
                BaseUnitType_ID = currentDisto.BaseUnitType_ID,
                Status = EntityStatus.INACTIVE,
                DocumentItem_ID = currentDisto.DocumentItem_ID,
                DocumentType_ID = currentDisto.DocumentType_ID
            };

            ADO.DistoADO.GetInstant().Create(newNextDisto, this.BuVO);

            return newNextDisto;
        }

        public List<amt_WorkQueue> nextWorkQueue(List<amt_DocumentItemStorageObject> nextDistos)
        {
            var bstos = ADO.StorageObjectADO.GetInstant().ListParent(nextDistos.Select(x => x.Sou_StorageObject_ID).ToArray(), this.BuVO);

            return null;
        }

        public amt_DocumentItemStorageObject NextDisto2(amt_Wave wave,amt_WaveSeq nextWaveSeq, amt_DocumentItemStorageObject currentDisto, TReq reqVO)
        {
            //List<amt_DocumentItemStorageObject> currentNextDistos = ADO.DistoADO.GetInstant()
            //    .List_bySouWaveSeq_bySouSto(currentDisto.Des_StorageObject_ID.Value, currentDisto.Des_StorageObject_ID.Value, this.BuVO);
            /*if(currentNextDistos.Sum(x=>x.BaseQuantity) + reqVO.NextDistoBaseQty > currentDisto.BaseQuantity)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนที่เลือก มากกว่า ที่กำหนด");
            }*/
            var bsto = ADO.StorageObjectADO.GetInstant().GetParent(currentDisto.Sou_StorageObject_ID, this.BuVO);

            var stoArea = this.StaticValue.AreaMasters.First(x => x.ID == bsto.AreaMaster_ID);
            var desArea = this.StaticValue.AreaMasters.First(x => x.ID == reqVO.DesAreaID);

            amt_WorkQueue newWQ = new amt_WorkQueue()
            {
                ID = null,
                ActualTime = null,

                RefID = AMWUtil.Common.ObjectUtil.GenUniqID(),
                Seq = 1,
                IOType = IOType.OUTPUT,
                Priority = wave.Priority,
                StorageObject_ID = bsto.ID.Value,
                StorageObject_Code = bsto.Code,
                
                Warehouse_ID = stoArea.Warehouse_ID.Value,
                Area_ID = bsto.AreaMaster_ID.Value,
                AreaLocation_ID = bsto.AreaLocationMaster_ID,

                Sou_Warehouse_ID = stoArea.Warehouse_ID.Value,
                Sou_Area_ID = bsto.AreaMaster_ID.Value,
                Sou_AreaLocation_ID = bsto.AreaLocationMaster_ID,

                Des_Area_ID = reqVO.DesAreaID,
                Des_AreaLocation_ID = reqVO.DesLocationID,
                Des_Warehouse_ID = desArea.Warehouse_ID.Value,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,

                StartTime = null,
                EndTime = null,
            };
            ADO.WorkQueueADO.GetInstant().PUT(newWQ, this.BuVO);


            amt_WaveSeq next2WaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.Seq == nextWaveSeq.Seq + 1);
            amt_DocumentItemStorageObject newNextDisto = new amt_DocumentItemStorageObject()
            {
                ID = null,
                Sou_WaveSeq_ID = currentDisto.Des_WaveSeq_ID,
                Sou_StorageObject_ID = currentDisto.Des_StorageObject_ID.Value,
                Des_WaveSeq_ID = next2WaveSeq == null ? null : next2WaveSeq.ID,
                Des_StorageObject_ID = null,
                WorkQueue_ID = newWQ.ID,
                Quantity = null,//currentDisto.Quantity * (reqVO.NextDistoBaseQty / currentDisto.BaseQuantity),
                UnitType_ID = currentDisto.UnitType_ID,
                BaseQuantity = null,//reqVO.NextDistoBaseQty,
                BaseUnitType_ID = currentDisto.BaseUnitType_ID,
                Status = EntityStatus.INACTIVE,
                DocumentItem_ID = currentDisto.DocumentItem_ID,
                DocumentType_ID = currentDisto.DocumentType_ID
            };



            ADO.DistoADO.GetInstant().Create(newNextDisto, this.BuVO);

            return newNextDisto;
        }
    }

}
