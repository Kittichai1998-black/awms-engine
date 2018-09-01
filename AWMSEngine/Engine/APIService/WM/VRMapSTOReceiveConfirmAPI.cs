using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.Business;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class VRMapSTOReceiveConfirmAPI : BaseAPIService
    {
        public VRMapSTOReceiveConfirmAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

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



            if (this.RequestVO.isConfirm == true)
            {

                //Validate
                new Engine.Validation.ValidateInnerSTOLowerlimit().Execute(this.Logger, this.BuVO, res);

                List<long> docIDs = new List<long>();
                if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0102) &&
                    !StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0100))
                {
                    //Create Doc AUTO
                    var doc = new Engine.Business.DocGoodsReceivedCreateBySTO().Execute(this.Logger, this.BuVO,
                        new DocGoodsReceivedCreateBySTO.TReq() { stomap = res });
                    docIDs.Add(doc.ID.Value);
                }
                else if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0100))
                {
                    //List Doc in Database
                    docIDs = new Engine.Business.DocRelationBySTO().Execute(this.Logger, this.BuVO, res).documents.Select(x => x.ID.Value).ToList();
                }


                //Close Doc ALL
                if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0100) || StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0102))
                {
                    if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0103))
                    {
                        new Engine.Business.DocGoodsReceivedClose().Execute(this.Logger, this.BuVO, new DocGoodsReceivedClose.TReq() { DocumentIDs = docIDs });
                    }
                }
            }
            return res;
        }
    }
}
