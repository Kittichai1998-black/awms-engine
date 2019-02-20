﻿using AMWUtil.Common;
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
            public string type;
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


                if (reqVO.type == "hold")
                {
                    if (stoData != StorageObjectEventStatus.RECEIVED)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "EventStatus is not RECEIVED");

                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, null, StorageObjectEventStatus.HOLD, this.BuVO);
                }
                else
                {
                    if (stoData != StorageObjectEventStatus.HOLD)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data is not Hold");

                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bstoid, null, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                }


                res.Add(ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO));

            }
            allRes.data = res;
            return allRes;
        }
    }
}
