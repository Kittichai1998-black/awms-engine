using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class WorkedDocument : BaseEngine<DoneAPI.TReq, DoneAPI.TRes>
    {
        protected override DoneAPI.TRes ExecuteEngine(DoneAPI.TReq reqVO)
        {
            var res = this.ExectProject<DoneAPI.TReq, DoneAPI.TRes>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {
                reqVO.docIDs.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                    {
                        if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item of Packs Not All Actived.");
                        }
                    }
                });
                res = new DoneAPI.TRes()
                {
                    docIDs = reqVO.docIDs
                };
            }

            return res;
        }

    }
}
