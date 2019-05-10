using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using AMWUtil.Exception;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public abstract class BaseRegisterWorkQueue : BaseQueue<BaseRegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public decimal? weight;//น้ำหนัก Kg.
            public decimal? width;//กว้าง M.
            public decimal? length;//ยาว M.
            public decimal? height;//สูง M.
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string locationCode;//รหัสเกต
            public DateTime actualTime;
            public List<PalletDataCriteriaV2> mappingPallets;
        }

        protected abstract StorageObjectCriteria GetSto(TReq reqVO);
        protected abstract List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO);


        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            if (GetSto(reqVO) != null)
            {
                var sto = GetSto(reqVO);
                //this.ValidateObjectSizeLimit(sto);
                var docItem = this.GetDocumentItemAndDISTO(sto, reqVO);

                var desLocation = this.GetDesLocations(sto, docItem, reqVO);
                var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.RECEIVING, this.BuVO);
                var docIDs = docItem.Select(x => x.Document_ID).Distinct().ToList();
                docIDs.ForEach(x =>
                {
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                });
                return this.GenerateResponse(sto, queueTrx);
            }
            else {
                throw new Exception( "Sto Invalid");
            }
        }

        private SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, TReq reqVO)
        {
            //reqVO.locationCode
            var desLocations = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.INPUT,sto.areaID,sto.parentID, this.BuVO);
            foreach(var des in desLocations)
            {
                if(!string.IsNullOrWhiteSpace(des.Condition_Eval) && Z.Expressions.Eval.Execute<bool>(des.Condition_Eval))
                {
                    return des;
                }
            }
            return desLocations.FirstOrDefault(x => x.DefaultFlag == YesNoFlag.YES);
        }
        private SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, SPOutAreaLineCriteria desLocation, TReq reqVO)
        {
            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = IOType.INPUT,
                ActualTime = reqVO.actualTime,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,

                StorageObject_ID = sto.id,
                StorageObject_Code = sto.code,

                Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == desLocation.Sou_AreaMaster_ID).Warehouse_ID.Value,
                AreaMaster_ID = desLocation.Sou_AreaMaster_ID.Value,
                AreaLocationMaster_ID = desLocation.Sou_AreaLocationMaster_ID,

                Sou_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == desLocation.Sou_AreaMaster_ID).Warehouse_ID.Value,
                Sou_AreaMaster_ID = desLocation.Sou_AreaMaster_ID.Value,
                Sou_AreaLocationMaster_ID = desLocation.Sou_AreaLocationMaster_ID,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == desLocation.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = desLocation.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = desLocation.Des_AreaLocationMaster_ID,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                StartTime = reqVO.actualTime,

                DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, sto)
            };
            workQ = ADO.WorkQueueADO.GetInstant().Create(workQ, this.BuVO);
            return workQ;
        }
        
    }
}
