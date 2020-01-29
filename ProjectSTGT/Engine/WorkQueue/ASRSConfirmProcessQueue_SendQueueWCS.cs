using AMWUtil.Logger;
using AWMSEngine.ADO.QueueApi;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTGT.Engine.WorkQueue
{
    public class ASRSConfirmProcessQueue_SendQueueWCS : IProjectEngine<List<RootStoProcess>, WCSQueueADO.TReq>
    {
        public WCSQueueADO.TReq ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<RootStoProcess> reqVO)
        {
            int outboundCount = 2;
            var wcQueue = new WCSQueueADO.TReq { queueOut = new List<WCSQueueADO.TReq.queueout>() };
            var staticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var getRsto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                    new SQLConditionCriteria("ID", string.Join(",", reqVO.Select(x => x.rstoID).Distinct().ToArray()), SQLOperatorType.IN)
                }, buVO);

            var groupRstos = reqVO.FindAll(rsto =>
            {
                var area = staticValue.AreaMasters.First(x => x.ID == rsto.souAreaID);
                //var areaType = StaticValue.AreaMasterTypes.First(x => x.ID == area.AreaMasterType_ID);
                return area.AreaMasterType_ID.Value == AreaMasterTypeID.STORAGE_ASRS;
            }).GroupBy(x =>
            {
                var docID = x.docItems.Select(y => y.docID).First();
                return docID;
            }).Select(x => new { docID = x.Key, rstos = x.ToList() }).ToList();

            groupRstos.ForEach(rstoByDoc =>
            {
                var docItemGroup = rstoByDoc.rstos.GroupBy(x => x.docItems.Select(y => y.docItemID).First()).Select(x => new { docItemID = x.Key, rstos = x.ToList()}).ToList();
                int docSeq = 1;
                int seq = 1;

                do
                {
                    foreach (var rstoByDocItemID in docItemGroup)
                    {
                        int count = 0;
                        var tempRemove = new List<RootStoProcess>();

                        foreach (var rsto in rstoByDocItemID.rstos)
                        {
                            count++;
                            if (count > outboundCount)
                            {
                                seq++;
                                break;
                            }

                            wcQueue.queueOut.Add(new WCSQueueADO.TReq.queueout()
                            {
                                priority = rsto.priority,
                                queueID = rsto.workQueueID.Value,
                                desWarehouseCode = staticValue.GetWarehousesCode(rsto.desWarehouseID),
                                desAreaCode = staticValue.GetAreaMasterCode(rsto.desAreaID),
                                desLocationCode = rsto.desLocationID.HasValue ?
                                               AWMSEngine.ADO.MasterADO.GetInstant().GetAreaLocationMaster(rsto.desLocationID.Value, buVO).Code :
                                               null,

                                baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                                {
                                    eventStatus = getRsto.FirstOrDefault(y => y.ID == rsto.rstoID).EventStatus,
                                    baseCode = rsto.rstoCode,
                                    pickSeqGroup = DateTime.Now.ToString("ddMMyyyyHHmmssss") + "_" + docSeq.ToString(),
                                    pickSeqIndex = seq,
                                    packInfos = rsto.docItems.Select(x => new WCSQueueADO.TReq.queueout.baseinfo.packinfo()
                                    {
                                        batch = x.pstoBatch,
                                        lot = x.pstoLot,
                                        skuCode = x.pstoCode,
                                        skuQty = x.pickBaseQty

                                    }).ToList()
                                }

                            });
                            tempRemove.Add(rsto);
                        }

                        if (rstoByDocItemID.rstos.Count() == 1)
                            seq++;

                        tempRemove.ForEach(rmvRsto =>
                        {
                            rstoByDocItemID.rstos.Remove(rmvRsto);
                        });


                    }
                }
                while (docItemGroup.Select(x => x.rstos.Count()).Sum(x => x) > 0);

                docSeq++;
            });
            return wcQueue;
        }
    }
}
