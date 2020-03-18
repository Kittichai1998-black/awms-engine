using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;
using AWMSEngine.Engine;
using AMWUtil.Logger;
using static ProjectTMC.Model.Criteria.SCADACriteria;
using static ProjectTMC.ADO.SCADAApi.SCADAInterfaceADO;
using ProjectTMC.ADO.SCADAApi;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;

namespace ProjectTMC.Engine.WorkQueue
{
    public class DoneQueue_SendLocation : IProjectEngine<DoneWorkQueue.TReqandWorkQueue, WorkQueueCriteria>
    {
        public WorkQueueCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, DoneWorkQueue.TReqandWorkQueue data)
        {

            var reqVO = data.reqVO;
            var workQueue_Criteria = data.workQ;
            var document = data.document;
            if (document.DocumentProcessType_ID != DocumentProcessTypeID.EPL_TRANSFER_WM)
            {
                var updateLocreq = new SCADA_SendLocation_REQ()
                {
                    PalletCode = reqVO.baseCode,
                    LocationCode = reqVO.locationCode,
                    PackCode = workQueue_Criteria.baseInfo.packInfos[0].code,
                    Quantity = workQueue_Criteria.baseInfo.packInfos[0].qty
                };

                var resSCADA = SendDataToSCADA_UpdateLoc(updateLocreq, document.ID.Value, buVO);

            }

            return workQueue_Criteria;
        }

        private TRes SendDataToSCADA_UpdateLoc(SCADA_SendLocation_REQ req, long? docID, VOCriteria buVO) 
        {
            var res = SCADAInterfaceADO.GetInstant().SendToSCADA(req, buVO);
            if (res._result.status == 1) // success
            {
                
            }
            else
            {
                LogException(docID, res._result.message, buVO);
            }
            return res;
        
        }
        private void LogException(long? docID, string message, VOCriteria buVO)
        {
            if (docID.HasValue)
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = docID.Value,
                    msgError = message
                });
            }

            throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, message);

        }
    }
}
