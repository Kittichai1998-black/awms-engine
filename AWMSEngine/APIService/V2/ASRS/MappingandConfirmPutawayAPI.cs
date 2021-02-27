using ADO.WMSDB;
using AMSModel.Criteria;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Received;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMSModel.Constant.EnumConst;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class MappingandConfirmPutawayAPI : BaseAPIService
    {
        public MappingandConfirmPutawayAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        public class TRes {
            public StorageObjectCriteria stos;
        } 

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            ScanMappingSTO.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<ScanMappingSTO.TReq>(this.RequestVO);
            var res = new ScanMappingSTO().Execute(this.Logger, this.BuVO, req);


            var resConfirmSTO = new ConfirmSTOReceivebyBaseMulti().Execute(this.Logger, this.BuVO,
                new ConfirmSTOReceivebyBaseMulti.TReq() { bstoID = res.bsto.id });

            var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() 
                { docIDs = resConfirmSTO.docIDs });
            this.CommitTransaction();
            TRes resSto = new TRes();
            resSto.stos =  StorageObjectADO.GetInstant().Get(res.bsto.id.Value, StorageObjectType.BASE, false, true, this.BuVO);

            return resSto;
        }
    }
}
