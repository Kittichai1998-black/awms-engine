using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Bussiness.WorkQueue
{
    public class FastMoveQueue: IEval
    {
        public bool exec(dynamic data)
        {
            //var str = "FeatureExecute.EvalExec(\"ProjectMRK.Engine.Bussiness.WorkQueue.FastMoveQueue\", new { baseCode = reqVO.baseCode, buVO = this.BuVO });";
            List<amt_StorageObject> stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(data.baseCode.ToString(), (VOCriteria)data.buVO).ToList();
            List<amt_Document> docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs.Select(x=>x.ID.Value).ToList(), (VOCriteria)data.buVO);
            var fastMove = docs.Any(x => x.MovementType_ID == AWMSModel.Constant.EnumConst.MovementType.FG_FASTMOVE);
            return fastMove;
        }
        private void CreateGIDocument(List<amt_Document> docs, List<amt_StorageObject> sto)
        {
            var createDocument = new AWMSEngine.Engine.Business.Issued.CreateDocument();
            var doc = new AWMSEngine.Engine.Business.Issued.CreateDocument.TReq
            {

            };
        }
    }
}
