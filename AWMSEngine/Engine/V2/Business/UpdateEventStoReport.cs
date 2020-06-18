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
            public int IsHold;
            public string remark;
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
                var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(bstoid, StorageObjectType.BASE, true, true, this.BuVO);
                //if (sto.eventStatus != StorageObjectEventStatus.RECEIVED)
                //    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Status ไม่ถูกต้อง");


                this.UpdateHoldStatus(this.Logger, sto, reqVO.remark,reqVO.IsHold, this.BuVO);

            res.Add(ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO));

            }
            allRes.data = res;
            return allRes;
        }
        private void UpdateHoldStatus(AMWLogger logger, StorageObjectCriteria sto ,string remark, int IsHold, VOCriteria buVO)
        {
            
            sto.IsHold = IsHold;
            
            foreach (var st in sto.mapstos)
            {
                st.IsHold = IsHold;
                st.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(st.options, OptionVOConst.OPT_REMARK, remark);
            }
             AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
        }
    }
}
