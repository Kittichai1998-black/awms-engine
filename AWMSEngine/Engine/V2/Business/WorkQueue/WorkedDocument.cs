using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class WorkedDocument : BaseEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            var res = this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {

                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        if(docs.DocumentType_ID != DocumentTypeID.AUDIT)
                        {
                            if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                            {
                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
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
