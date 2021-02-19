using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Wave
{
    public class NextDistoWaveSeq : BaseEngine<NextDistoWaveSeq.TReq, List<amt_DocumentItemStorageObject>>
    {
        public class TReq
        {
            public long DesAreaID;
            public long? DesLocationID;
            //public long CurrentBaseStoID;
            public List<long> CurrentDistoIDs; //change sou_sto
            //public decimal NextDistoBaseQty;
        }

        protected override List<amt_DocumentItemStorageObject> ExecuteEngine(TReq reqVO)
        {
            List<amt_DocumentItemStorageObject> currentDistos = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria("ID", string.Join(',', reqVO.CurrentDistoIDs.ToArray()), SQLOperatorType.IN), this.BuVO);

            if (currentDistos.Any(x => x.Status == EntityStatus.INACTIVE))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สถานะสินค้ายังไม่สิ้นสุด");
            }
            if (currentDistos.Any(x => x.Status == EntityStatus.DONE))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "งานจบแล้ว ไม่สารถสั่งทำงานได้");
            }
            if (currentDistos.Any(x => !x.Sou_WaveSeq_ID.HasValue))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่มีการใช้งาน Wave");
            }

            List<amt_DocumentItemStorageObject> nextDistos = new List<amt_DocumentItemStorageObject>();
            List<amt_WorkQueue> wqs = new List<amt_WorkQueue>();

            var groupDisto = currentDistos.GroupBy(disto => new { sou_sto = disto.Sou_StorageObject_ID, des_sto = disto.Des_StorageObject_ID })
                .Select(x => new { x.Key.sou_sto, x.Key.des_sto, distos = x.ToList() }).ToList();

            groupDisto.ForEach(gDisto =>
            {
                var firstDisto = gDisto.distos.FirstOrDefault();

                amt_Wave wave = ADO.WMSDB.WaveADO.GetInstant().GetWaveAndSeq_byWaveSeq(firstDisto.Sou_WaveSeq_ID.Value, this.BuVO);
                amt_WaveSeq currentWaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.ID == firstDisto.Sou_WaveSeq_ID);
                amt_WaveSeq nextWaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.ID == firstDisto.Des_WaveSeq_ID);
                var bsto = ADO.WMSDB.StorageObjectADO.GetInstant().GetParent(gDisto.sou_sto, this.BuVO);
                var psto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(gDisto.sou_sto, StorageObjectType.PACK, false, false, this.BuVO);
                var stoArea = this.StaticValue.AreaMasters.First(x => x.ID == bsto.AreaMaster_ID);
                var desArea = this.StaticValue.AreaMasters.First(x => x.ID == reqVO.DesAreaID);

                if (nextWaveSeq != null)
                {
                    if (nextWaveSeq.EventStatus == WaveEventStatus.NEW)
                    {
                        nextWaveSeq.EventStatus = WaveEventStatus.WORKING;
                        ADO.WMSDB.WaveADO.GetInstant().PutSeq(nextWaveSeq, this.BuVO);
                    }

                    amt_WorkQueue wq = new amt_WorkQueue();

                    if (stoArea.AreaMasterType_ID != AreaMasterTypeID.STO_ASRS && stoArea.AreaMasterType_ID != AreaMasterTypeID.STA_PICK)
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้าไม่ได้อยู่ในพื้นที่เบิกสินค้า ไม่สามารถเบิกสินค้าได้");

                    var findOldWQ = wqs.Find(x => x.StorageObject_ID == bsto.ID);

                    if (stoArea.AreaMasterType_ID == AreaMasterTypeID.STO_ASRS && findOldWQ == null && psto.eventStatus != nextWaveSeq.Start_StorageObject_EventStatus)
                    {
                        wq = this.NextWorkQueue(bsto, wave, stoArea, desArea, reqVO);
                        wqs.Add(wq);
                    }
                    else
                    {
                        wq = findOldWQ;
                    }

                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.ID.Value, currentWaveSeq.End_StorageObject_EventStatus, null, nextWaveSeq.Start_StorageObject_EventStatus, this.BuVO);
                    psto.eventStatus = nextWaveSeq.Start_StorageObject_EventStatus;

                    if (psto.eventStatus != nextWaveSeq.Start_StorageObject_EventStatus)
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่พบสินค้าที่มีสถานะพร้อมทำงานได้");

                    nextDistos.Add(NextDisto(wave, nextWaveSeq, gDisto.distos.First(), wq));
                }

                gDisto.distos.ForEach(disto =>
                {
                    ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                    gDisto.distos.First().Status = EntityStatus.DONE;
                });

                var curWaveDisto = ADO.WMSDB.DistoADO.GetInstant().ListBySouWaveSeq(firstDisto.Sou_WaveSeq_ID.Value, this.BuVO);

                var prevWaveSeq = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_WaveSeq>(new SQLConditionCriteria[]{
                        new SQLConditionCriteria("Seq", currentWaveSeq.Seq - 1, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Wave_ID", currentWaveSeq.Wave_ID, SQLOperatorType.EQUALS),
                    }, this.BuVO).FirstOrDefault();

                if (prevWaveSeq != null)
                {
                    if ((prevWaveSeq.EventStatus == WaveEventStatus.WORKED) && curWaveDisto.TrueForAll(x => x.Status == EntityStatus.DONE))
                    {
                        currentWaveSeq.EventStatus = WaveEventStatus.WORKED;
                        currentWaveSeq.Status = EntityStatus.ACTIVE;
                        ADO.WMSDB.WaveADO.GetInstant().PutSeq(currentWaveSeq, this.BuVO);
                    }
                }
                else
                {
                    if (curWaveDisto.TrueForAll(x => x.Status == EntityStatus.DONE))
                    {
                        currentWaveSeq.EventStatus = WaveEventStatus.WORKED;
                        currentWaveSeq.Status = EntityStatus.ACTIVE;
                        ADO.WMSDB.WaveADO.GetInstant().PutSeq(currentWaveSeq, this.BuVO);
                        var docItem = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(firstDisto.DocumentItem_ID, this.BuVO);
                        new WorkedDocByWave().Execute(this.Logger, this.BuVO, new WorkedDocByWave.TReq() { docIDs = new List<long>() { docItem.Document_ID } });
                    }
                }

                if (wave.WaveSeqs.TrueForAll(x => x.EventStatus == WaveEventStatus.WORKED))
                {
                    wave.EventStatus = WaveEventStatus.WORKED;
                    ADO.WMSDB.WaveADO.GetInstant().Put(wave, this.BuVO);
                }
                if (wave.EventStatus == WaveEventStatus.WORKED)
                {
                    ADO.WMSDB.WaveADO.GetInstant().UpdateStatusToChild(wave.ID.Value, WaveEventStatus.WORKED, null, WaveEventStatus.CLOSING, this.BuVO);
                }
                var waveClosing = ADO.WMSDB.WaveADO.GetInstant().Get(wave.ID.Value, this.BuVO);
                if (waveClosing.EventStatus == WaveEventStatus.CLOSING)
                {
                    ADO.WMSDB.WaveADO.GetInstant().UpdateStatusToChild(wave.ID.Value, WaveEventStatus.CLOSING, null, WaveEventStatus.CLOSED, this.BuVO);
                }
            });

            nextDistos.ForEach(disto =>
            {
                amt_Wave wave = ADO.WMSDB.WaveADO.GetInstant().GetWaveAndSeq_byWaveSeq(disto.Sou_WaveSeq_ID.Value, this.BuVO);
                amt_WaveSeq curWaveSeq = wave.WaveSeqs.FirstOrDefault(x => x.ID == disto.Sou_WaveSeq_ID);
                if (curWaveSeq.AutoDoneSeq)
                {
                    var doneSeq = new DoneDistoWaveSeq();
                    if (disto.WorkQueue_ID.HasValue)
                    {
                        if (curWaveSeq.WCSDone)
                        {
                            doneSeq.Execute(this.Logger, this.BuVO, new DoneDistoWaveSeq.TReq()
                            {
                                distos = new List<DoneDistoWaveSeq.TReq.DistoList>()
                                {
                                    new DoneDistoWaveSeq.TReq.DistoList(){ distoID=disto.ID.Value }
                                }
                            });
                        }
                    }
                    else
                    {
                        doneSeq.Execute(this.Logger, this.BuVO, new DoneDistoWaveSeq.TReq()
                        {
                            distos = new List<DoneDistoWaveSeq.TReq.DistoList>()
                                {
                                    new DoneDistoWaveSeq.TReq.DistoList(){ distoID=disto.ID.Value }
                                }
                        });
                    }
                }
                else
                {
                    var doneSeq = new DoneDistoWaveSeq();
                    if (disto.WorkQueue_ID.HasValue)
                    {
                        if (curWaveSeq.WCSDone)
                        {
                            doneSeq.Execute(this.Logger, this.BuVO, new DoneDistoWaveSeq.TReq()
                            {
                                distos = new List<DoneDistoWaveSeq.TReq.DistoList>()
                                {
                                    new DoneDistoWaveSeq.TReq.DistoList(){ distoID=disto.ID.Value }
                                }
                            });
                        }
                    }
                }
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

            var res = ADO.WMSDB.DistoADO.GetInstant().Insert(newNextDisto, this.BuVO);

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
                IOType = IOType.OUTBOUND,
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

                EventStatus = WorkQueueEventStatus.NEW,
                Status = EntityStatus.ACTIVE,

                StartTime = null,
                EndTime = null,
            };
            var wq = ADO.WMSDB.WorkQueueADO.GetInstant().PUT(newWQ, this.BuVO);

            return wq;
        }
    }

}
