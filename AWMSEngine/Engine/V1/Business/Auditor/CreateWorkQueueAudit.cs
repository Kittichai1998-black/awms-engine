using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class CreateWorkQueueAudit : BaseEngine<CreateWorkQueueAudit.TReq, CreateWorkQueueAudit.TRes>
    {
        public class TReq
        {
            public long docID;
            public List<WorkQueue> workQueue;
            public List<amt_DocumentItemStorageObject> disto;
        }

        public class WorkQueue : SPworkQueue
        {
            public long docItemID;
            public bool QueueStatus;
        }

        public class TRes
        {
            public long docID;
            public List<ItemList> listItems;
            public class ItemList
            {
                public string palletCode;
                public string itemCode;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes listQueue = new TRes();
            var itemLists = new List<TRes.ItemList>();
            var queueCheck = new WCSQueueADO.TReq();
            var queueWorkQueue = new WCSQueueADO.TReq();
            var queueOut = new List<WCSQueueADO.TReq.queueout>();
            var queueOut2 = new List<WCSQueueADO.TReq.queueout>();

            reqVO.workQueue.ForEach(x =>
            {
                if (x.QueueStatus == true)
                {
                    if (x.Sou_AreaMaster_ID == 5)
                    {
                        var baseInfo = new WCSQueueADO.TRes.queueout.baseinfo();
                        baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                        {
                            baseCode = x.StorageObject_Code,
                            packInfos = null
                        };

                        queueOut.Add(new WCSQueueADO.TReq.queueout()
                        {
                            queueID = null,
                            baseInfo = baseInfo,
                            desAreaCode = this.StaticValue.AreaMasters.Where(y => y.ID == x.Des_AreaMaster_ID).FirstOrDefault().Code,
                            desLocationCode = null,
                            desWarehouseCode = this.StaticValue.Warehouses.Where(y => y.ID == x.Des_Warehouse_ID).FirstOrDefault().Code,
                            priority = x.Priority
                        });
                    }
                }
            });
            queueCheck.queueOut = queueOut;
            if (queueOut.Count > 0)
            {
                //var wcsRes = WCSQueueApi.GetInstant().SendQueue(queueCheck, this.BuVO);
                //if (wcsRes._result.resultcheck == 0)
                //{
                //    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกสินค้าในรายการได้");
                //}
            }
            List<amt_DocumentItemStorageObject> distoList = new List<amt_DocumentItemStorageObject>();
            reqVO.disto.ForEach(x =>
            {
                distoList.Add(ADO.DocumentADO.GetInstant().InsertMappingSTO(x, this.BuVO));
                ADO.DocumentADO.GetInstant().UpdateMappingSTO(x.ID.Value, EntityStatus.INACTIVE, this.BuVO);//ADD BY TOM
                var res = ADO.StorageObjectADO.GetInstant().Get(x.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                var resBase = ADO.StorageObjectADO.GetInstant().Get(res.parentID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                itemLists.Add(new TRes.ItemList { itemCode = res.code, palletCode = resBase.code });
            });

            reqVO.workQueue.ForEach(x =>
            {
                if(x.QueueStatus == true)
                {
                    var getStatusSto = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                    var getStoList = getStatusSto.ToTreeList().Where(sto => sto.type == StorageObjectType.PACK).Select(sel => sel.id).ToArray();
                    if (getStatusSto.eventStatus != StorageObjectEventStatus.RECEIVED)
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้าอยู่ในสถานะ" + getStatusSto.eventStatus + "ไม่สามารถเบิกสินค้าตรวจสอบได้");

                    if (x.Sou_AreaMaster_ID == 5)//ASRS
                    {
                        var distoItem = distoList.Where(dis => getStoList.Contains(dis.Sou_StorageObject_ID)).ToList();
                        var getDocItem = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]{
                            new SQLConditionCriteria("ID", distoList.Select(sto => sto.DocumentItem_ID ).ToList(), SQLOperatorType.IN)
                        }, this.BuVO);
                        //ADD BY TOM
                        var docItemAudits = ADO.DocumentADO.GetInstant().ListItemBySTO(new List<long> { x.StorageObject_ID.Value }, DocumentTypeID.AUDIT, this.BuVO);
                        var bsto = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                        x.DocumentItemWorkQueues = AWMSEngine.Common.ConverterModel.ToDocumentItemWorkQueue(docItemAudits.Count == 0 ? getDocItem : docItemAudits, bsto);
                        //***

                        var resWorkQueue = ADO.WorkQueueADO.GetInstant().Create_LossVersion(x, this.BuVO);

                        var baseInfo = new WCSQueueADO.TRes.queueout.baseinfo();
                        baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                        {
                            baseCode = resWorkQueue.StorageObject_Code,
                            packInfos = null
                        };

                        queueOut2.Add(new WCSQueueADO.TReq.queueout()
                        {
                            queueID = resWorkQueue.ID,
                            baseInfo = baseInfo,
                            desAreaCode = this.StaticValue.AreaMasters.Where(y => y.ID == resWorkQueue.Des_AreaMaster_ID).FirstOrDefault().Code,
                            desLocationCode = null,
                            desWarehouseCode = this.StaticValue.Warehouses.Where(y => y.ID == resWorkQueue.Des_Warehouse_ID).FirstOrDefault().Code,
                            priority = resWorkQueue.Priority
                        });
                    }
                }
                
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.StorageObject_ID.Value, null, null, StorageObjectEventStatus.AUDITING, this.BuVO);
            });

            queueCheck.queueOut = queueOut2;
            if (queueOut2.Count > 0)
            {
                //var wcsAcceptRes = WCSQueueApi.GetInstant().SendQueue(queueCheck, this.BuVO);
                //if (wcsAcceptRes._result.resultcheck == 0)
                //{
                //    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกสินค้าในรายการได้");
                //}
            }
            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
            listQueue.docID = reqVO.docID;
            listQueue.listItems = itemLists;
            return listQueue;
        }
    }
}
