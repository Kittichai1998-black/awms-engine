using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class ConfirmMapSTOReceiveAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 64;
        }
        public ConfirmMapSTOReceiveAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new ConfirmReceivedMapSTO().Execute(this.Logger, this.BuVO,
                new ConfirmReceivedMapSTO.TReqModle()
                {
                    isConfirm = this.RequestVO.isConfirm,
                    rootStoID = this.RequestVO.rootStoID,
                    type = (StorageObjectType)this.RequestVO.type
                });



            if (this.RequestVO.isConfirm == true)
            {

                //Validate
                new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, res);
                new ValidateObjectSizeLowerLimit().Execute(this.Logger, this.BuVO, res);

                List<long> docIDs = new List<long>();
                if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0102) &&
                    !StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0100))
                {
                    //Create Doc AUTO
                    var doc = new CreateGRDocumentBySTO().Execute(this.Logger, this.BuVO,
                        new CreateGRDocumentBySTO.TReq() { stomap = res });
                    if (doc == null || doc.ID == null) return res;
                    docIDs.Add(doc.ID.Value);
                }
                else if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0100))
                {
                    //List Doc in Database
                    docIDs = new GetDocumnetRelationBySTO().Execute(this.Logger, this.BuVO, res).documents.Select(x => x.ID.Value).ToList();
                }


                //Close Doc ALL
                if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0100) || StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0102))
                {
                    if (StaticValueManager.GetInstant().IsFeature(FeatureCode.IB0103))
                    {
                        new WorkedGRDocument().Execute(this.Logger, this.BuVO, new WorkedGRDocument.TReq() { DocumentIDs = docIDs });
                    }
                }
            }
            return res;
        }
    }
}
