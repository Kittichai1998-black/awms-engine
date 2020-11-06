using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class RegisterWorkQueueAuto  : BaseQueue<RegisterWorkQueue.TReq, WorkQueueCriteria>
    {
       
        protected override WorkQueueCriteria ExecuteEngine(RegisterWorkQueue.TReq reqVO)
        {

            var regQueue = new RegisterWorkQueue();
            var resRegQueue = regQueue.Execute(this.Logger, this.BuVO, reqVO);

            if(resRegQueue != null)
            {
                var wcsRes = ADO.WCSAPI.WCSQueueADO.GetInstant().SendConfirm(resRegQueue, this.BuVO);
                if (wcsRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, wcsRes._result.resultmessage);
                }
                else
                {
                    return resRegQueue;
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "พาเลทมีปัญหา สร้างคิวรับเข้าไม่สำเร็จ");
            }
        }
    }
}
