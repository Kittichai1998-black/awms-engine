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

                //Create Doc AUTO
                var doc = new CreateGRDocumentBySTO().Execute(this.Logger, this.BuVO,
                    new CreateGRDocumentBySTO.TReq() { stomap = res });
                if (doc == null || doc.ID == null) return res;
                docIDs.Add(doc.ID.Value);

                //Close Doc ALL
                foreach (long docID in docIDs)
                {
                    var docItemsSto = AWMSEngine.ADO.DocumentADO.GetInstant()
                       .ListStoInDocs(docID, this.BuVO);
                    docItemsSto.ForEach(disto =>
                    {
                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, null, null, EntityStatus.ACTIVE, this.BuVO);
                    });
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, EntityStatus.ACTIVE, DocumentEventStatus.CLOSED, this.BuVO);
                }
                //new WorkedGRDocument().Execute(this.Logger, this.BuVO, new WorkedGRDocument.TReq() { DocumentIDs = docIDs });

            }
            return res;
        }
    }
}
