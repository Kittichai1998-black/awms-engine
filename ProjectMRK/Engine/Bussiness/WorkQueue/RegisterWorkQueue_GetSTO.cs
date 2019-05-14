using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectMRK.Engine.Bussiness.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<RegisterWorkQueue.TReq, List<amt_DocumentItem>>
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            var distos = new List<amt_DocumentItem>();
            var stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, buVO).Select(x => x.ID.Value).ToList();
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, buVO);

            docs.ForEach(x =>
            {
                distos.AddRange(AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x.ID.Value, buVO));
            });

            return distos;
        }
    }
}
