using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectMRK.Engine.Bussiness.WorkQueue
{
    public class CreateRecievingQueue : BaseRegisterWorkQueue
    {
        protected override List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            var stoList = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, this.BuVO);
            return null;
        }

        protected override StorageObjectCriteria GetSto(TReq reqVO)
        {
            throw new NotImplementedException();
        }
    }
}
