using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ClosedDocument : BaseEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            var res = this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueClosed, reqVO);
            if (res == null)
            {
                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        var distos = ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO);
                        if (distos == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item Not Found");

                        if (distos.TrueForAll(y => y.Status == EntityStatus.ACTIVE))
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
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Document Not Found");
                    }
                }); 
            }

            return reqVO;
        }

    }
}
