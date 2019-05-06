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
            var sto = GetSto(reqVO);
            this.ValidateObjectSizeLimit(sto);
            var docItem = this.GetDocumentItemAndDISTO(sto, reqVO);

            var desLocation = this.GetDesLocations(sto, docItem, reqVO);
            var queueTrx = this.CreateWorkQueue(sto, docItem, desLocation, reqVO);
            return this.GenerateResponse(sto, queueTrx);
        }

        private SPOutAreaLineCriteria GetDesLocations(StorageObjectCriteria sto, List<amt_DocumentItem> docItems, TReq reqVO)
        {
            //reqVO.locationCode
            var desLocations = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.INPUT, sto.areaID, 0, this.BuVO);
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
            return null;
        }


        
    }
}
