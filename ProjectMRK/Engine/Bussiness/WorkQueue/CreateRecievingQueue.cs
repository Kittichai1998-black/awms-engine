using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectMRK.Engine.Bussiness.WorkQueue
{
    public class CreateRecievingQueue : BaseRegisterWorkQueue
    {
        protected override List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            var distos = new List<amt_DocumentItem>();
            var stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, this.BuVO).Select(x => x.ID.Value).ToList();
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, this.BuVO);

            docs.ForEach(x =>
            {
                distos.AddRange(AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x.ID.Value, this.BuVO));
            });

            return distos;
        }

        protected override StorageObjectCriteria GetSto(TReq reqVO)
        {
            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, this.BuVO);
            return stos;
        }

        public bool FastMoveChecker(TReq reqVO)
        {
            var stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, this.BuVO).Select(x => x.ID.Value).ToList();
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, this.BuVO);
            var fastMove = docs.Any(x => x.MovementType_ID == AWMSModel.Constant.EnumConst.MovementType.FG_FASTMOVE);
            return fastMove;
        }
    }
}
