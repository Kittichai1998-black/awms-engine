using AMWUtil.Common;
using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business.Issued;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ASRSCreatWaveProcessQueue : BaseEngine<ASRSCreatWaveProcessQueue.TReq, ASRSCreatWaveProcessQueue.TRes>
    {

        public class TReq : ASRSProcessQueue.TRes
        {
            public bool flagAuto = false;
            public bool isSetQtyAfterDoneWQ = true;
            public WaveRunMode waveRunMode;
            public DateTime? scheduleTime;
        }
        public class TRes
        {
            public long WaveID;
            public List<RootStoProcess> confirmResult;
            public List<long> CurrentDistoIDs;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
          
            var docs = ADO.WMSDB.DocumentADO.GetInstant().ListAndItem(reqVO.processResults.GroupBy(x => x.docID).Select(x => x.Key).ToList(), this.BuVO);
            if (docs.Count() == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document not Found");

            if(string.IsNullOrWhiteSpace( reqVO.desASRSAreaCode))
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "AreaCode is null");

            this.ValidateDocAndInitDisto(docs);
            var rstos = this.ListRootStoProcess(reqVO, docs);



            var wave = this.InsertWave(reqVO);
            //List<amt_DocumentItemStorageObject> distos = new List<amt_DocumentItemStorageObject>();

            var Allocate = new AllocatedDistoWaveSeq();
            var AlloDisto = new List<long>();

            var docItemProcess = new List<RootStoProcess.DocItem>();

            rstos.ForEach(rs => rs.docItems.ForEach(docitem =>
            {
                docItemProcess.Add(docitem);
                var AllocatedDisto = Allocate.Execute(this.Logger, this.BuVO, new AllocatedDistoWaveSeq.TReq()
                {
                    DocItemID = docitem.docItemID,
                    PackStoBaseQty = docitem.pickBaseQty,
                    PackStoID = docitem.pstoID,
                    WaveID = wave.ID.Value

                });

                AlloDisto.Add(AllocatedDisto.ID.Value);
            }));

            var groupDocItem = docItemProcess.GroupBy(x => x.docItemID).Select(x => new { docItem = x.Key, processItem = x.ToList() }).ToList();
            groupDocItem.ForEach(x =>
            {
                var item = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItem>(x.docItem, this.BuVO);
                item.ActualBaseQuantity = x.processItem.Sum(y => y.pickBaseQty);
                ADO.WMSDB.DocumentADO.GetInstant().PutItem(item, this.BuVO);
            });

            /////////////////////////////////CREATE Document(GR) Cross Dock
            //var docGRCDs = Common.FeatureExecute.ExectProject<List<amt_Document>, List<amt_Document>>(FeatureCode.EXEWM_ASRSConfirmProcessQueue_CreateGRCrossDock, this.Logger, this.BuVO, docs);

            //this.WCSSendQueue(rstos);

            return new TRes() { WaveID= wave.ID.Value, confirmResult = rstos, CurrentDistoIDs = AlloDisto };
        }

        private List<RootStoProcess> ListRootStoProcess(TReq reqVO, List<amt_Document> docs)
        {
            ams_AreaMaster desAM = new ams_AreaMaster();
            ams_AreaLocationMaster desALM = new ams_AreaLocationMaster();
            var desWM = this.StaticValue.Warehouses.First(x => x.Code == reqVO.desASRSWarehouseCode);

            if (reqVO.desASRSAreaCode != null)
            {
                 desAM = this.StaticValue.AreaMasters.First(x => x.Warehouse_ID == desWM.ID && x.Code == reqVO.desASRSAreaCode);
                 desALM = ADO.WMSDB.MasterADO.GetInstant().GetAreaLocationMaster(reqVO.desASRSLocationCode, desAM.ID.Value, this.BuVO);
            }
            List<RootStoProcess> rstoProcs = new List<RootStoProcess>();
            reqVO.processResults.ForEach(x =>
            {
                StorageObjectEventStatus? stoDoneSouEventStatus = null;
                StorageObjectEventStatus? stoDoneDesEventStatus = null;
                var doc = ADO.WMSDB.DocumentADO.GetInstant().Get(x.docID, this.BuVO);
                ProcessQueueDoneStatus statusSTO = null;// Common.FeatureExecute.ExectProject<amt_Document, ProcessQueueDoneStatus>(FeatureCode.EXEWM_CUSTOM_STO_EVENTSTATUS, this.Logger, this.BuVO, doc);
                if (statusSTO != null)
                {
                    stoDoneSouEventStatus = statusSTO.stoDoneSouEventStatus;
                    stoDoneDesEventStatus = statusSTO.stoDoneDesEventStatus;
                }

                x.processResultItems.ForEach(y =>
                {
                    y.pickStos.ForEach(z => { AddRootStoProcess(z, false); });
                    if (y.lockStos != null)
                        y.lockStos.ForEach(z => { AddRootStoProcess(z, true); });
                    void AddRootStoProcess(SPOutSTOProcessQueueCriteria z, bool lockOnly)
                    {
                        var doc = docs.First(a => a.ID == x.docID);
                        var rsto = rstoProcs.FirstOrDefault(a => a.rstoID == z.rstoID);
                        if (rsto != null)
                        {
                            rsto.lockOnly = lockOnly;
                            rsto.docItems.Add(new RootStoProcess.DocItem()
                            {
                                docID = x.docID,
                                docItemID = y.docItemID,

                                bstoID = z.bstoID,
                                bstoCode = z.bstoCode,
                                pstoID = z.pstoID,
                                pstoCode = z.pstoCode,

                                pickQty = z.pickQty,
                                pickBaseQty = z.pickBaseQty,
                                pickUnitID = z.pstoUnitID,
                                pickBaseUnitID = z.pstoBaseUnitID,

                                useFullPick = z.useFullPick,
                            });

                            rsto.stoDoneSouEventStatus = stoDoneSouEventStatus;
                            rsto.stoDoneDesEventStatus = stoDoneDesEventStatus;
                        //rsto.pstoQty += z.pstoQty;
                        //rsto.pstoBaseQty += z.pstoBaseQty;
                        rsto.priority = (rsto.priority > y.priority ? rsto.priority : y.priority);
                        }
                        else
                        {
                            rstoProcs.Add(new RootStoProcess()
                            {
                                lockOnly = lockOnly,
                            //docID = x.docID,
                            //docItemID = y.docItemID,
                            docItems = new List<RootStoProcess.DocItem>() {
                                        new RootStoProcess.DocItem()
                                        {
                                            docID = x.docID,
                                            docItemID = y.docItemID,

                                            bstoID = z.bstoID,
                                            bstoCode = z.bstoCode,
                                            pstoID = z.pstoID,
                                            pstoCode = z.pstoCode,

                                            pickQty = z.pickQty,
                                            pickBaseQty = z.pickBaseQty,
                                            pickUnitID = z.pstoUnitID,
                                            pickBaseUnitID = z.pstoBaseUnitID,

                                        }},
                                priority = y.priority,

                                rstoID = z.rstoID,
                                rstoCode = z.rstoCode,

                                warehouseID = z.warehouseID,
                                areaID = z.areaID,
                                locationID = z.locationID,

                                souWarehouseID = z.warehouseID,
                                souAreaID = z.areaID,

                                desWarehouseID = desWM.ID.Value,
                                desAreaID = desAM == null?null : desAM.ID,
                                desLocationID = desALM == null ? null : desALM.ID,
                            });
                        }
                    }
                });
            });
            return rstoProcs;
        }
        private void ValidateDocAndInitDisto(List<amt_Document> docs)
        {
            docs.ForEach(x =>
            {
                x.DocumentItems.ForEach(doci => doci.DocItemStos = new List<amt_DocumentItemStorageObject>());
                if (x.EventStatus != DocumentEventStatus.NEW)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "'" + x.Code + "' is not NEW.");
                }
            });
        }
        private amt_Wave InsertWave(TReq reqVO)
        {
            amt_Document doc = new amt_Document();

            List<ams_WaveSeqTemplate> waveTemplate = new List<ams_WaveSeqTemplate>();
            var Wave = new amt_Wave()
            {
                IOType = IOType.OUTBOUND,
                Code = "Code",
                Name = "Name",
                Des_Area_ID = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.desASRSAreaCode).ID.Value,
                Description = "Description",
                RunMode = reqVO.waveRunMode,
                RunScheduleTime = reqVO.waveRunMode == WaveRunMode.SCHEDULE ? reqVO.scheduleTime : null,
                Priority = 2,
                StartTime = null,
                EndTime = null,
                Status = EntityStatus.ACTIVE,
                EventStatus = WaveEventStatus.NEW
            };
            var WaveID = ADO.WMSDB.WaveADO.GetInstant().Put(Wave, this.BuVO);
            if (WaveID == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถสร้าง wave ได้");

            reqVO.processResults.ForEach(x =>
                {
                    doc = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(x.docID, this.BuVO);

                    doc.Wave_ID = WaveID.Value;
                    ADO.WMSDB.DocumentADO.GetInstant().Put(doc, this.BuVO);


                    waveTemplate = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_WaveSeqTemplate>(
                     new SQLConditionCriteria[] {
                        new SQLConditionCriteria("DocumentProcessType_ID",doc.DocumentProcessType_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS)
                     }, this.BuVO);

                });

            waveTemplate.ForEach(temp =>
            {

                var WaveSeq = new amt_WaveSeq()
                {
                    Wave_ID = WaveID.Value,
                    Seq = temp.Seq,
                    Start_StorageObject_EventStatus = temp.Start_StorageObject_EventStatus,
                    End_StorageObject_EventStatus = temp.End_StorageObject_EventStatus,
                    AutoNextSeq = temp.AutoNextSeq,
                    AutoDoneSeq = temp.AutoDoneSeq,
                    WCSDone = temp.WCSDone,
                    StartTime = temp.StartTime,
                    EndTime = temp.EndTime,
                    EventStatus = WaveEventStatus.NEW,
                    Status = EntityStatus.ACTIVE
                };
                var WaveResult = ADO.WMSDB.WaveADO.GetInstant().PutSeq(WaveSeq, this.BuVO);
            });
            var wave = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Wave>(WaveID, this.BuVO);
            return wave;
        }
    }
}
