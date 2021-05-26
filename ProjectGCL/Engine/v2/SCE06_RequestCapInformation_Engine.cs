using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class SCE06_RequestCapInformation_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Request_CAP, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Request_CAP reqVO)
        {
            reqVO.RECORD.LINE.ForEach(x =>
            {
                exec(x);
            });

            return new TRES__return();
        }
        private void exec(TREQ_Request_CAP.TRecord.TLine req)
        {
        }
    }
}
