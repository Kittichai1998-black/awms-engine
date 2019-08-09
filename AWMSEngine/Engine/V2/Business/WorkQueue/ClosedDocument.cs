using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ClosedDocument : BaseEngine<DoneAPI.TReq, DoneAPI.TRes>
    {
        protected override DoneAPI.TRes ExecuteEngine(DoneAPI.TReq reqVO)
        {
            var res = this.ExectProject<DoneAPI.TReq, DoneAPI.TRes>(FeatureCode.EXEWM_DoneQueueClosed, reqVO);
            if (res == null)
            {
                reqVO.docIDs.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);

                    if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                        }
                        else
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, null, null, DocumentEventStatus.CLOSED, this.BuVO);
                        }
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item of Packs Not All Actived.");
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
