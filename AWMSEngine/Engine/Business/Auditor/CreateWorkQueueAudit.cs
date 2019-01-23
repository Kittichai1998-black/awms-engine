using AMWUtil.Common;
using AMWUtil.Exception;
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
            public List<SPworkQueue> workQueue;
            public List<amt_DocumentItemStorageObject> disto;
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
            reqVO.workQueue.ForEach(x =>
            {
                var getStatusSto =  ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID.Value, StorageObjectType.BASE, false, false, this.BuVO);
                if (getStatusSto.eventStatus != StorageObjectEventStatus.RECEIVED)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้าอยู่ในสถานะ" + getStatusSto.eventStatus + "ไม่สามารถเบิกสินค้าตรวจสอบได้");

                SPworkQueue res = new SPworkQueue();
                if(x.Sou_AreaMaster_ID == 5)
                    res = ADO.WorkQueueADO.GetInstant().PUT(x, this.BuVO);

                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.StorageObject_ID.Value, null, null, StorageObjectEventStatus.AUDITING, this.BuVO);
            });
            reqVO.disto.ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().MappingSTO(x, this.BuVO);
                var res = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                var resBase = ADO.StorageObjectADO.GetInstant().Get(res.parentID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                itemLists.Add(new TRes.ItemList { itemCode = res.code, palletCode = resBase.code });
            });

            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
            listQueue.docID = reqVO.docID;
            listQueue.listItems = itemLists;
            return listQueue;
        }

    }
}
