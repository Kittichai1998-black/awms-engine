using ADO.WMSStaticValue;
using AMSModel.Criteria;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectGCL.ADOGCL
{
    public class SceAPI : ADO.BaseAPI<SceAPI>
    {
        public TRES__return Receive_Confirm(TREQ_Receive_Confirm datas, VOCriteria buVO)
        {
            string endpoint = StaticValueManager.GetInstant().GetConfigValue("gcl.sce.endpoint.receive_confirm");
            var res = this.SendJson<TRES__return>(endpoint, datas, buVO);
            return res;
        }
        public TRES__return Allocated_LPN(TREQ_Allocated_LPN datas, VOCriteria buVO)
        {
            string endpoint = StaticValueManager.GetInstant().GetConfigValue("gcl.sce.endpoint.allocated_lpn");
            var res = this.SendJson<TRES__return>(endpoint, datas, buVO);
            return res;
        }
        public TRES__return Picking_Confirm(TREQ_Picking_Confirm datas, VOCriteria buVO)
        {
            string endpoint = StaticValueManager.GetInstant().GetConfigValue("gcl.sce.endpoint.picking_confirm");
            var res = this.SendJson<TRES__return>(endpoint, datas, buVO);
            return res;
        }
        public TRES__return Internal_Move(TREQ_Internal_Move datas, VOCriteria buVO)
        {
            string endpoint = StaticValueManager.GetInstant().GetConfigValue("gcl.sce.endpoint.internal_move");
            var res = this.SendJson<TRES__return>(endpoint, datas, buVO);
            return res;
        }
    }
}
