using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
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
            public bool isSetQtyAfterDoneWQ = true;
        }
        public class TRes
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docs = ADO.DocumentADO.GetInstant().ListAndItem(reqVO.processResults.GroupBy(x => x.docID).Select(x => x.Key).ToList(), this.BuVO);
            if (docs.Count() == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document not Found");

            //StorageObjectEventStatus stoNextEventStatus;

            //if (docs.First().DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
            //    stoNextEventStatus = StorageObjectEventStatus.PICKING;
            //else if (docs.First().DocumentType_ID == DocumentTypeID.AUDIT)
            //    stoNextEventStatus = StorageObjectEventStatus.AUDITING;
            //else
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document not " + docs.First().DocumentType_ID + " not Support");

            this.ValidateDocAndInitDisto(docs);
            var rstos = this.ListRootStoProcess(reqVO, docs);
            //List<amt_DocumentItemStorageObject> distos = new List<amt_DocumentItemStorageObject>();
           












            /////////////////////////////////CREATE Document(GR) Cross Dock
            var docGRCDs = Common.FeatureExecute.ExectProject<List<amt_Document>, List<amt_Document>>(FeatureCode.EXEWM_ASRSConfirmProcessQueue_CreateGRCrossDock, this.Logger, this.BuVO, docs);

            //this.WCSSendQueue(rstos);

            return new TRes() { confirmResult = rstos, docGRCrossDocks = docGRCDs };
        }

        

        private List<RootStoProcess> ListRootStoProcess(TReq reqVO, List<amt_Document> docs)
        {
            var desWM = this.StaticValue.Warehouses.First(x => x.Code == reqVO.desASRSWarehouseCode);
            var desAM = this.StaticValue.AreaMasters.First(x => x.Warehouse_ID == desWM.ID && x.Code == reqVO.desASRSAreaCode);
            var desALM = ADO.MasterADO.GetInstant().GetAreaLocationMaster(reqVO.desASRSLocationCode, desAM.ID.Value, this.BuVO);
            List<RootStoProcess> rstoProcs = new List<RootStoProcess>();
            reqVO.processResults.ForEach(x =>
            {
                StorageObjectEventStatus? stoDoneSouEventStatus = null;
                StorageObjectEventStatus? stoDoneDesEventStatus = null;
                var doc = ADO.DocumentADO.GetInstant().Get(x.docID, this.BuVO);
                var statusSTO = Common.FeatureExecute.ExectProject<amt_Document, ProcessQueueDoneStatus>(FeatureCode.EXEWM_CUSTOM_STO_EVENTSTATUS, this.Logger, this.BuVO, doc);
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
                                desAreaID = desAM.ID.Value,
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
        private void InsertWave(TReq reqVO)
        {
            AWMSEngine.ADO.DataADO.GetInstant().Insert<amt_Wave>(this.BuVO, new amt_Wave()
            {
                IOType= IOType.OUTPUT,
                Code = "",
                Name ="",
                Description = "",
                RunMode = 0,
                RunScheduleTime = null,
                Priority = 2,
                StartTime = null,
                EndTime =null,
                Status = EntityStatus.ACTIVE,
                EventStatus = WaveEventStatus.NEW
            });



        }
    }
}
