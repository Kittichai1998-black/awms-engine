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
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public abstract class BaseRegisterWorkQueue : BaseQueue<BaseRegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public IOType ioType = IOType.INPUT;
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
            var sto = GetSto(reqVO);
            if (sto != null)
            {

                //var sto = GetSto(reqVO);
                this.SetWeiChildAndUpdateInfoToChild(sto, reqVO.weight ?? 0 );
                //ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
                this.ValidateObjectSizeLimit(sto);
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


        public void SetWeiChildAndUpdateInfoToChild(StorageObjectCriteria sto, decimal totalWeiKG)
        {
            var stoTreeList = sto.ToTreeList();
            var packMasters = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            var baseMasters = ADO.DataADO.GetInstant().SelectByID<ams_BaseMaster>(stoTreeList.Where(x => x.type == StorageObjectType.BASE).FirstOrDefault().m,this.BuVO);
            //*****SET WEI CODING

            sto.weiKG = totalWeiKG;
            var innerTotalWeiKG = totalWeiKG - (baseMasters.WeightKG.Value);

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters
                .Sum(x =>
                    (x.WeightKG ?? 0) *
                    sto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));

            sto.mapstos.FindAll(x => x.type == StorageObjectType.PACK).ForEach(stos =>
            {
                decimal percentWeiStd =
                (
                    packMasters.First(x => x.ID == sto.mstID).WeightKG.Value *
                    sto.qty
                ) / totalWeiStd;
                sto.weiKG = percentWeiStd * innerTotalWeiKG;
            });

            long areaID = sto.areaID.Value;
            stoTreeList.ForEach(x =>
            {
                x.areaID = areaID;
                ADO.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });
         
        }

        private SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, TReq reqVO)
        {
            //reqVO.locationCode
            var desLocations = ADO.AreaADO.GetInstant().ListDestinationArea(reqVO.ioType, sto.areaID.Value,sto.parentID, this.BuVO);
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
