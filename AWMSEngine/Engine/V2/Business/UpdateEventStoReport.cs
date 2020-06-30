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
            public int IsHold;
            public string remark; 
            public bool RemarkMode;
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
                var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(bstoid, StorageObjectType.BASE, false, true, this.BuVO);
                if (reqVO.RemarkMode)
                {
                    this.UpdateRemark(this.Logger, sto, reqVO.remark, this.BuVO);
                }
                else
                {
                  
                    this.UpdateHoldStatus(this.Logger, sto, reqVO.remark, reqVO.IsHold, this.BuVO);
                }
                

            res.Add(ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO));

            }
            allRes.data = res;
            return allRes;
        }
        private void UpdateHoldStatus(AMWLogger logger, StorageObjectCriteria sto ,string remark, int IsHold, VOCriteria buVO)
        {
            
            sto.IsHold = IsHold;
            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, remark);

            var checkStatus = sto.mapstos.TrueForAll(x => x.eventStatus == StorageObjectEventStatus.RECEIVED);
            if (!checkStatus)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Status ไม่ถูกต้อง");

            foreach (var st in sto.mapstos)
            {
                st.IsHold = IsHold;
                AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(st, this.BuVO);
            }
            AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
        }
        private void UpdateRemark(AMWLogger logger, StorageObjectCriteria sto, string remark, VOCriteria buVO)
        {

            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, remark);
            AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
        }
    }
}
