using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.StringConst;
using AWMSEngine.Engine.Business.Picking;

namespace AWMSEngine.APIService.ASRS
{
    public class DoneQueueAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 16;
        }

        public DoneQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            DoneQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQueue.TReq>(this.RequestVO);
            WorkQueueCriteria res = new DoneQueue().Execute(this.Logger, this.BuVO, req);

            new Engine.General.MoveStoInGateToNextArea().Execute(this.Logger, this.BuVO, new Engine.General.MoveStoInGateToNextArea.TReq()
            {
                baseStoID = res.baseInfo.id
            });
            var getQueue = ADO.DataADO.GetInstant().SelectByID<amt_WorkQueue>(req.queueID.Value, this.BuVO);
            var bsto = ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(getQueue.StorageObject_ID, this.BuVO);
            //this.CommitTransaction();

            if (getQueue.IOType == IOType.OUTPUT && bsto.EventStatus == StorageObjectEventStatus.PICKING)
            {
                //this.BeginTransaction();
                var resPick = new PickBaseSto_WorkedDoc()
                    .Execute(this.Logger, this.BuVO, new PickBaseSto_WorkedDoc.TReq()
                    {
                        baseStoID = getQueue.StorageObject_ID
                    });
                this.CommitTransaction();

                if (resPick.docs.Any(x => x.EventStatus == DocumentEventStatus.WORKED))
                {
                    this.BeginTransaction();
                    var resLocal = new ClosingGIDocument().Execute(this.Logger, this.BuVO, new ClosingGIDocument.TDocReq()
                    {
                        auto = 0,
                        docIDs = resPick.docs.Where(x => x.EventStatus == DocumentEventStatus.WORKED).Select(x => x.ID.Value).ToArray()
                    });
                    this.CommitTransaction();

                    this.BeginTransaction();
                    var resSAP = new ClosedGIDocument().Execute(this.Logger, this.BuVO, new ClosedGIDocument.TDocReq()
                    {
                        docIDs = resPick.docs.Where(x => x.EventStatus == DocumentEventStatus.WORKED).Select(x => x.ID.Value).ToArray()
                    });
                    this.CommitTransaction();
                }

            }
            return res;
        }
    }
}
