using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RejectReceiveWorkQueue : BaseQueue<RejectReceiveWorkQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long wqID;
        }

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var wq = ADO.WorkQueueADO.GetInstant().Get(reqVO.wqID, this.BuVO);
            if(wq != null)
            {
                if(wq.IOType == IOType.INPUT && (wq.Status == EntityStatus.ACTIVE || wq.Status == EntityStatus.INACTIVE))
                {
                    var distos = ADO.DocumentADO.GetInstant().ListDistoByWorkQueue(reqVO.wqID, this.BuVO);
                    var sto = RejectStorageObject(wq, distos);
                    RejectDocument(sto, distos);

                    wq.Status = EntityStatus.REMOVE;
                    wq.EventStatus = WorkQueueEventStatus.REMOVED;
                    ADO.WorkQueueADO.GetInstant().PUT(wq, this.BuVO);

                    return this.GenerateResponse(sto, wq);
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Cannot Reject Work Queue ID : " + reqVO.wqID.ToString() + "");
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Work Queue ID : " + reqVO.wqID.ToString() + " Not Found.");
            }
        }

        private void RejectDocument(StorageObjectCriteria sto, List<amt_DocumentItemStorageObject> distos)
        {
            var docItemIDs = new List<long>();
            distos.ForEach(disto =>
            {
                if(disto.DocumentItem_ID.HasValue)
                    docItemIDs.Add(disto.DocumentItem_ID.Value);

                disto.Status = EntityStatus.REMOVE;
                ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, EntityStatus.REMOVE, this.BuVO);
            });

            var getAutoDoc = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_AUTO_DOC);

            if (docItemIDs.Count > 0)
            {
                var getDocIDs = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID", docItemIDs.Distinct().JoinString(','), SQLOperatorType.IN),
                }, this.BuVO).Select(x=> x.Document_ID).Distinct().ToList();

                getDocIDs.ForEach(docID =>
                {
                    var distosByDoc = ADO.DocumentADO.GetInstant().ListDISTOByDoc(docID, this.BuVO);

                    if(distosByDoc.TrueForAll(disto => disto.Status == EntityStatus.REMOVE))
                    {
                        if (getAutoDoc == "true")
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, null, DocumentEventStatus.REJECTED, this.BuVO);
                        }
                        else
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, null, DocumentEventStatus.NEW, this.BuVO);
                        }
                    }
                });
            }
        }

        private StorageObjectCriteria RejectStorageObject(SPworkQueue wq, List<amt_DocumentItemStorageObject> distos)
        {
            var sto = ADO.StorageObjectADO.GetInstant().Get(wq.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            var stoPacks = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);

            stoPacks.ForEach(stoPack =>
            {
                var getOldEvent = ObjectUtil.QryStrGetValue(stoPack.options, "_old_event_status");
                var getDocItem = distos.Find(disto => disto.Sou_StorageObject_ID == stoPack.id);
                if (getDocItem.DocumentItem_ID.HasValue)
                {
                    if (string.IsNullOrEmpty(getOldEvent))
                    {
                        stoPack.eventStatus = StorageObjectEventStatus.REMOVED;
                    }
                    else
                    {
                        stoPack.eventStatus = AMWUtil.Common.EnumUtil.GetValueEnum<StorageObjectEventStatus>(getOldEvent);
                    }

                    ADO.StorageObjectADO.GetInstant().PutV2(stoPack, this.BuVO);
                }
            });

            if (stoPacks.TrueForAll(stoPack => stoPack.eventStatus == StorageObjectEventStatus.REMOVED))
            {
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
            }
            else
            {
                sto.eventStatus = StorageObjectEventStatus.NEW;
                sto.areaID = wq.Sou_AreaMaster_ID;
                sto.parentID = wq.Sou_AreaLocationMaster_ID;
                ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
            }

            return sto;
        }
    }
}
