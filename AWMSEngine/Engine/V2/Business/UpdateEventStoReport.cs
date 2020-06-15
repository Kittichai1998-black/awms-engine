using AMWUtil.Common;
using AMWUtil.Exception;
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
                var stoData = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO).EventStatus;


                //if (reqVO.eventStatus == 99)
                //{
                //    if (stoData != StorageObjectEventStatus.RECEIVED && stoData != StorageObjectEventStatus.QC && stoData != StorageObjectEventStatus.PARTIAL && stoData != StorageObjectEventStatus.RETURN && stoData != StorageObjectEventStatus.HOLD)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "EventStatus is not RECEIVED / QC / PARTIAL / RETURN");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.HOLD, this.BuVO);
                //}
                //else if (reqVO.eventStatus == 12)
                //{
                //    if (stoData != StorageObjectEventStatus.HOLD && stoData != StorageObjectEventStatus.QC && stoData != StorageObjectEventStatus.PARTIAL && stoData != StorageObjectEventStatus.RETURN && stoData != StorageObjectEventStatus.RECEIVED)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data is not QC / HOLD / PARTIAL / RETURN");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
                //}
                //else if (reqVO.eventStatus == 98)
                //{
                //    if (stoData != StorageObjectEventStatus.RECEIVED && stoData != StorageObjectEventStatus.HOLD && stoData != StorageObjectEventStatus.RETURN && stoData != StorageObjectEventStatus.PARTIAL)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "EventStatus is not  RECEIVED / HOLD / PARTIAL / RETURN");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.QC, this.BuVO);
                //}
                //else if (reqVO.eventStatus == 96)
                //{
                //    if (stoData != StorageObjectEventStatus.RECEIVED && stoData != StorageObjectEventStatus.HOLD && stoData != StorageObjectEventStatus.QC && stoData != StorageObjectEventStatus.PARTIAL)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "EventStatus is not RECEIVED / HOLD / QC / PARTIAL ");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RETURN, this.BuVO);
                //}
                //else if (reqVO.eventStatus == 97)
                //{
                //    if (stoData != StorageObjectEventStatus.RECEIVED && stoData != StorageObjectEventStatus.HOLD && stoData != StorageObjectEventStatus.QC && stoData != StorageObjectEventStatus.RETURN)
                //        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "EventStatus is not RECEIVED / HOLD / QC / RETURN ");

                //    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, EntityStatus.ACTIVE, StorageObjectEventStatus.PARTIAL, this.BuVO);
                //}



                res.Add(ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO));

            }
            allRes.data = res;
            return allRes;
        }
    }
}
