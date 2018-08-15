using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.Business;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class VRMapSTOReceiveConfirmAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new VRMapSTOReceiveConfirm().Execute(this.Logger, this.BuVO,
                new Business.VRMapSTOReceiveConfirm.TReqModle()
                {
                    isConfirm = this.RequestVO.isConfirm,
                    rootStoID = this.RequestVO.rootStoID,
                    type = (StorageObjectType)this.RequestVO.type
                });

            new Engine.Validation.ValidateInnerSTOLowerlimit().Execute(this.Logger, this.BuVO, res);

            if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0102))
            {
                var doc = new Engine.Business.DocGoodsReceivedCreateBySTO().Execute(this.Logger, this.BuVO,
                    new DocGoodsReceivedCreateBySTO.TReq() { stomap = res });
                if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0103))
                {
                    new Engine.Business.DocGoodsReceivedClose().Execute(this.Logger, this.BuVO, new DocGoodsReceivedClose.TReq() { DocumentID = doc.ID.Value });
                }
            }
            return res;
        }
    }
}
