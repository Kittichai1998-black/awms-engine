using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class UpdateEventStoReport : BaseEngine<UpdateEventStoReport.TDocReq, UpdateEventStoReport.TDocRes>
    {
        public class TDocReq
        {
            public long[] bstosID;
            public long eventStatus;
        }
        public class TDocRes
        {
            public List<amt_StorageObject> data;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {

            TDocRes allRes = new TDocRes();
            List<amt_StorageObject> res = new List<amt_StorageObject>();
            foreach (var bstoid in reqVO.bstosID)
            {
                //var stoData = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO).EventStatus;


                //if (reqVO.eventStatus == 99)
                //{
                //    if (stoData != StorageObjectEventStatus.RECEIVED)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "EventStatus is not RECEIVED");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.HOLD, this.BuVO);
                //}
                //else
                //{
                //    if (stoData != StorageObjectEventStatus.HOLD && stoData != StorageObjectEventStatus.QC && stoData != StorageObjectEventStatus.PARTIAL && stoData != StorageObjectEventStatus.RETURN && stoData != StorageObjectEventStatus.RECEIVED)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data is not QC / HOLD / PARTIAL / RETURN");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
                //}




                res.Add(ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO));

            }
            allRes.data = res;
            return allRes;
        }
        //private amt_DocumentItemStorageObject UpdateHoldStatus(AMWLogger logger, long bstoid, VOCriteria buVO)
        //{
        //    var sto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(, this.BuVO);

        //    return null;
        //}
    }
}
