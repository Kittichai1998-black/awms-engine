using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;
using AWMSEngine.Engine;
using AMWUtil.Logger;
using static ProjectTMC.Model.SCADACriteria;
using static ProjectTMC.ADO.SCADAApi.SCADAInterfaceADO;
using ProjectTMC.ADO.SCADAApi;
using AMWUtil.Exception;

namespace ProjectTMC.Engine.WorkQueue
{
    public class DoneQ_SendLocation : IProjectEngine<DoneQ.TReqandWorkQueue, WorkQueueCriteria>
    {
        public WorkQueueCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, DoneQ.TReqandWorkQueue data)
        {
            var reqVO = data.reqVO;
            var workQueue_Criteria = data.workQ;
            var updateLocreq = new SCADA_SendLocation_REQ() {
                PalletCode = reqVO.baseCode,
                LocationCode = reqVO.locationCode,
                PackCode = workQueue_Criteria.baseInfo.packInfos[0].code,
                Quantity = workQueue_Criteria.baseInfo.packInfos[0].qty
            };

            var resSCADA = SendDataToSCADA_UpdateLoc(updateLocreq, data.docID.Value, buVO);

            return workQueue_Criteria;
        }

        private SCADAResponse SendDataToSCADA_UpdateLoc(SCADA_SendLocation_REQ req, long? docID, VOCriteria buVO) 
        {
            var res = SCADAInterfaceADO.GetInstant().SendLocation(req, buVO);
            if (res.datas != null)
            {
                
            }
            else
            {
                LogException(docID, res.message, buVO);
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
