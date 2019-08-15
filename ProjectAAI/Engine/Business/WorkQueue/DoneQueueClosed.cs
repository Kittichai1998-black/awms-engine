using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using ProjectAAI.ADO.SAPApi;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;
using static ProjectAAI.ADO.SAPApi.SAPInterfaceADO;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class DoneQueueClosed : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
            reqVO.ForEach(x =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                if (docs != null)
                {

                    var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, buVO);
                    if (distos == null)
                        throw new AMWException(logger, AMWExceptionCode.B0001, "Document Item Not Found");

                    if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                    {
                        distos.ForEach(disto => {
                            var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(disto.WorkQueue_ID.Value, buVO);
                            var resSAP = ReqSTOToSAP(queue.StorageObject_Code, buVO);
                        });
                    }
                    

                    if (distos.TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, buVO);
                        }
                        else
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, null, null, DocumentEventStatus.CLOSED, buVO);
                        }
                    }
                }
                else
                {
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Document Not Found");
                }
            });

            return reqVO;
        }
        private SapResponse<ZSWMRF002_OUT_SU> ReqSTOToSAP(string suCode, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF002(suCode, buVO);
            return res;
        }
    }
}
