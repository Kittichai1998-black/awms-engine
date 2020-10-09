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
            public bool IsHold;
            public string remark; 
            public bool RemarkMode;
            public string mode;
            public string aditStatus;

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
                var sto = AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().Get(bstoid, StorageObjectType.PACK,false, false, this.BuVO);
                if (reqVO.RemarkMode)
                {
                    this.UpdateRemark(this.Logger, sto, reqVO.remark, this.BuVO);
                }
                else
                {
                    if (reqVO.mode == "audit") {
                        this.UpdateAuditStatus(this.Logger, sto, reqVO.remark, reqVO.aditStatus, this.BuVO);
                    }
                    else
                    {
                        this.UpdateHoldStatus(this.Logger, sto, reqVO.remark, reqVO.IsHold, this.BuVO);
                        var bsto = AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().Get(sto.parentID.Value, StorageObjectType.PACK, false, true, this.BuVO);

                        var ckHold = bsto.mapstos.TrueForAll(x => x.IsHold == reqVO.IsHold);
                        if (ckHold)
                        {
                            bsto.IsHold = reqVO.IsHold;
                            AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(bsto, this.BuVO);
                        }

                    }
                }
                

            res.Add(ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_StorageObject>(bstoid, this.BuVO));

            }
            allRes.data = res;
            return allRes;
        }

        private void UpdateAuditStatus(AMWLogger logger, StorageObjectCriteria sto, string remark, string aditStatus, VOCriteria buVO)
        {
            AuditStatus AdStatus = EnumUtil.GetValueEnum<AuditStatus>(aditStatus);

            sto.AuditStatus = AdStatus;
            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, remark);

            var checkStatus = sto.mapstos.TrueForAll(x => x.eventStatus == StorageObjectEventStatus.RECEIVED);
            if (!checkStatus)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Status ไม่ถูกต้อง");

            AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
        }


        private void UpdateHoldStatus(AMWLogger logger, StorageObjectCriteria sto ,string remark, bool IsHold, VOCriteria buVO)
        {
            
            sto.IsHold = IsHold;
            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, remark);

            var checkStatus = sto.mapstos.TrueForAll(x => x.eventStatus == StorageObjectEventStatus.RECEIVED);
            if (!checkStatus)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Status ไม่ถูกต้อง");

            //foreach (var st in sto.mapstos)
            //{
            //    st.IsHold = IsHold;
            //    AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(st, this.BuVO);
            //}
            AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
        }
        private void UpdateRemark(AMWLogger logger, StorageObjectCriteria sto, string remark, VOCriteria buVO)
        {

            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, remark);
            AWMSEngine.ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
        }
    }
}
