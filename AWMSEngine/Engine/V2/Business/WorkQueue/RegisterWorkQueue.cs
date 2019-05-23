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
using AWMSEngine.Common;
using Microsoft.CodeAnalysis.Scripting;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RegisterWorkQueue : BaseQueue<RegisterWorkQueue.TReq, WorkQueueCriteria>
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
            public string desWarehouseCode; 
            public string desAreaCode;
            public string desLocationCode;
            public DateTime actualTime;
            public List<PalletDataCriteriaV2> mappingPallets;
        }

        public class TReqDocumentItemAndDISTO
        {
            public StorageObjectCriteria sto;
            public TReq reqVO;
        } 

        protected StorageObjectCriteria GetSto(TReq reqVO)
        {
            var res = this.ExectProject<TReq, StorageObjectCriteria>(FeatureCode.EXEPJ_RegisterWorkQueue_GetSTO, reqVO);
            if(res == null)
            {
                ////DF Code
            }
            return res;
        }
        protected List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            var res = this.ExectProject<TReqDocumentItemAndDISTO, List<amt_DocumentItem>>(FeatureCode.EXEPJ_RegisterWorkQueue_GetDocumentItemAndDISTO, new TReqDocumentItemAndDISTO() { sto = sto, reqVO = reqVO });
            if (res == null)
            {
                ////DF Code
            }

            return res;
        }

        protected SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, TReq reqVO)
        { 
            SPOutAreaLineCriteria res = this.ExectProject<TReqDocumentItemAndDISTO, SPOutAreaLineCriteria>(FeatureCode.EXEPJ_RegisterWorkQueue_GetDesLocations, new TReqDocumentItemAndDISTO() { sto = sto, reqVO = reqVO });
            if (res == null)
            {
                if (string.IsNullOrWhiteSpace(reqVO.desAreaCode))
                {
                    var desLocations = ADO.AreaADO.GetInstant().ListDestinationArea(reqVO.ioType, sto.areaID.Value, sto.parentID, this.BuVO);
                    res = desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
                }
                else
                {
                    res = new SPOutAreaLineCriteria()
                    {
                        Sou_AreaMaster_Code = reqVO.areaCode,
                        Des_AreaMaster_Code = reqVO.desAreaCode
                    };
                }
            }
            return res;
        }

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var sto = GetSto(reqVO);
            if (sto != null)
            {
                this.SetWeiChildAndUpdateInfoToChild(sto, reqVO.weight ?? 0 );
                this.ValidateObjectSizeLimit(sto);
                var docItem = GetDocumentItemAndDISTO(sto, reqVO);
                var desLocation = this.GetDesLocations(sto, reqVO);
                var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.RECEIVING, this.BuVO);
               
                if(docItem != null)
                {
                    var docIDs = docItem.Select(x => x.Document_ID).Distinct().ToList();
                    docIDs.ForEach(x =>
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                    });
                }

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
            var baseMasters = ADO.DataADO.GetInstant().SelectByID<ams_BaseMaster>(stoTreeList.Where(x => x.type == StorageObjectType.BASE).FirstOrDefault().mstID.Value, this.BuVO);
            //*****SET WEI CODING

            sto.weiKG = totalWeiKG;
            var innerTotalWeiKG = totalWeiKG - (baseMasters.WeightKG);

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters.Sum(x =>(x.WeightKG ?? 0) *sto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));

            sto.mapstos.FindAll(x => x.type == StorageObjectType.PACK).ForEach(stos =>
            {
                decimal percentWeiStd =
                (
                    packMasters.First(x => x.ID == stos.mstID).WeightKG.Value *
                    sto.qty
                )  /totalWeiStd;
                sto.weiKG = percentWeiStd * innerTotalWeiKG;
            });

            long areaID = sto.areaID.Value;
            stoTreeList.ForEach(x =>
            {
                x.areaID = areaID;
                ADO.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });
         
        }
 

        private SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, SPOutAreaLineCriteria location, TReq reqVO)
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

                Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.Code == reqVO.areaCode).Warehouse_ID.Value,
                AreaMaster_ID = this.StaticValue.AreaMasters.First(x => x.Code == reqVO.areaCode).ID.Value,
                AreaLocationMaster_ID = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO).ID,
     

                Sou_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.Code == reqVO.areaCode).Warehouse_ID.Value,
                Sou_AreaMaster_ID = this.StaticValue.AreaMasters.First(x => x.Code == reqVO.areaCode).ID.Value,
                Sou_AreaLocationMaster_ID = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO).ID,

                Des_Warehouse_ID = this.StaticValue.AreaMasters.First(x => x.ID == location.Des_AreaMaster_ID).Warehouse_ID.Value,
                Des_AreaMaster_ID = location.Des_AreaMaster_ID.Value,
                Des_AreaLocationMaster_ID = location.Des_AreaLocationMaster_ID,

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
