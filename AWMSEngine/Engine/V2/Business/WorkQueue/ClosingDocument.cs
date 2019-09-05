using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ClosingDocument : BaseEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            var res = this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueClosing, reqVO);
            if (res == null)
            {
                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                        {
                            var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                            if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                            {
                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
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
