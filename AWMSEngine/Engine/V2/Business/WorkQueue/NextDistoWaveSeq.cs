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
    public class NextDistoWaveSeq : BaseEngine<NextDistoWaveSeq.TReq, List<amt_DocumentItemStorageObject>>
    {
        public class TReq
        {
            public long DesAreaID;
            public long? DesLocationID;
            //public long CurrentBaseStoID;
            public List<long> CurrentDistoIDs;
            //public decimal NextDistoBaseQty;
        }

        protected override List<amt_DocumentItemStorageObject> ExecuteEngine(TReq reqVO)
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

            var groupDisto = currentDistos.GroupBy(disto => disto.Sou_StorageObject_ID).Select(x => new { sou_sto = x.Key, distos = x.ToList() }).ToList();

            groupDisto.ForEach(gDisto =>
            {
                var firstDisto = gDisto.distos.FirstOrDefault();
                amt_Wave wave = ADO.WaveADO.GetInstant().GetWaveAndSeq_byWaveSeq(firstDisto.Sou_WaveSeq_ID.Value, this.BuVO);
                amt_WaveSeq nextWaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.ID == firstDisto.Des_WaveSeq_ID);
                var bsto = ADO.StorageObjectADO.GetInstant().GetParent(gDisto.sou_sto, this.BuVO);
                var stoArea = this.StaticValue.AreaMasters.First(x => x.ID == bsto.AreaMaster_ID);
                var desArea = this.StaticValue.AreaMasters.First(x => x.ID == reqVO.DesAreaID);
                amt_WorkQueue wq = new amt_WorkQueue();

                if(stoArea.AreaMasterType_ID != AreaMasterTypeID.STO_ASRS && stoArea.AreaMasterType_ID != AreaMasterTypeID.STO_STAGING)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้าไม่ได้อยู่ในพื้นที่เบิกสินค้า ไม่สามารถเบิกสินค้าได้");

                if (stoArea.AreaMasterType_ID == AreaMasterTypeID.STO_ASRS)
                {
                    wq = this.NextWorkQueue(bsto, wave, stoArea, desArea, reqVO);
                }

                gDisto.distos.ForEach(disto =>
                {
                    nextDistos.Add(NextDisto(wave, nextWaveSeq, disto, wq));
                });

            });

            return nextDistos;
        }
        public amt_DocumentItemStorageObject NextDisto(amt_Wave wave, amt_WaveSeq nextWaveSeq, amt_DocumentItemStorageObject currentDisto, amt_WorkQueue wq)
        {
            amt_WaveSeq next2WaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.Seq == nextWaveSeq.Seq + 1);
            amt_DocumentItemStorageObject newNextDisto = new amt_DocumentItemStorageObject()
            {
                ID = null,
                Sou_WaveSeq_ID = currentDisto.Des_WaveSeq_ID,
                Sou_StorageObject_ID = currentDisto.Des_StorageObject_ID.Value,
                Des_WaveSeq_ID = next2WaveSeq == null ? null : next2WaveSeq.ID,
                Des_StorageObject_ID = null,
                WorkQueue_ID = wq == null ? null : wq.ID,
                Quantity = null,//currentDisto.Quantity * (reqVO.NextDistoBaseQty / currentDisto.BaseQuantity),
                UnitType_ID = currentDisto.UnitType_ID,
                BaseQuantity = null,//reqVO.NextDistoBaseQty,
                BaseUnitType_ID = currentDisto.BaseUnitType_ID,
                Status = EntityStatus.INACTIVE,
                DocumentItem_ID = currentDisto.DocumentItem_ID,
                DocumentType_ID = currentDisto.DocumentType_ID
            };

            var res = ADO.DistoADO.GetInstant().Create(newNextDisto, this.BuVO);

            return res;
        }

        public amt_WorkQueue NextWorkQueue(amt_StorageObject bsto, amt_Wave wave, ams_AreaMaster stoArea, ams_AreaMaster desArea, TReq reqVO)
        {
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
            var wq = ADO.WorkQueueADO.GetInstant().PUT(newWQ, this.BuVO);

            return wq;
        }
    }

}
