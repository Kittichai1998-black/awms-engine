using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.Engine.Business.WorkQueue
{
    public class DoneQueueWorked : IProjectEngine<DoneQueue.TReq, WorkQueueCriteria>
    {
        public WorkQueueCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, DoneQueue.TReq reqVO)
        {
            List<amt_Document> docs = new List<amt_Document>();
            var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, buVO);
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemByWorkQueueDisto(reqVO.queueID.Value, buVO);

            var docsCode = docItems.Select(x => x.Document_ID).Distinct().ToList();

            docsCode.ForEach(x =>
            {
                var doc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                docs.Add(doc);
            });

            docs.ForEach(doc =>
            {
                var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(doc.ID.Value, buVO);
                if (doc.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                {
                    if (AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(doc.ID.Value, buVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, buVO);
                    }
                }
                else if(doc.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                {
                    var sumDisto = distos.FindAll(x => x.Status == EntityStatus.ACTIVE).GroupBy(x => x.DocumentItem_ID).Select(x => new { documentItemID = x.Key, sumBaseQty = x.Sum(y => y.BaseQuantity) }).ToList();

                    sumDisto.ForEach(x =>
                    {
                        var docItem = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(x.documentItemID, buVO);

                        if (docItem.BaseQuantity <= x.sumBaseQty)
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, buVO);
                        else
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKING, buVO);
                    });

                }
                else
                {
                    if (queue.IOType == IOType.INPUT)
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    null, null, StorageObjectEventStatus.RECEIVED, buVO);

                        distos.Where(disto => disto.WorkQueue_ID == queue.ID.Value).ToList().ForEach(y =>
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(y.ID.Value, EntityStatus.ACTIVE, buVO);
                        });

                        if (AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(doc.ID.Value, buVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, buVO);
                        }
                    }
                    else
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                StorageObjectEventStatus.AUDITING, null, StorageObjectEventStatus.AUDITING, buVO);
                    }
                }
            });

            return new WorkQueueCriteria();
        }
    }
}
