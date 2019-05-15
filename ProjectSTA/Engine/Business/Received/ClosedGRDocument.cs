using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectSTA.Engine.Business
{
    public class ClosedGRDocument : AWMSEngine.Engine.BaseEngine<ClosedGRDocument.TReq, string>
    {
        public class TReq
        {
            public long[] docIDs;
        }
 
        protected override string ExecuteEngine(TReq reqVO)
        {
            foreach (var num in reqVO.docIDs)
            {
                var doc = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amv_Document>(num, this.BuVO);

                var docItemsSto = AWMSEngine.ADO.DocumentADO.GetInstant()
                       .ListStoInDocs(num, this.BuVO);
                if (docItemsSto.Any(x => x.Status == EntityStatus.INACTIVE))
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(num, 
                        null, null, DocumentEventStatus.WAIT_FOR_WORKED, this.BuVO);
                }
                else
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(num,
                        null, null, DocumentEventStatus.CLOSED, this.BuVO);
                }

            }
            return null;
        }
    }
}
