using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Engine;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Controller
{
    public class McRuntimeController : BaseController<McRuntimeController>
    {


        private List<BaseMcRuntime> McObjectList { get; set; }

        public void AddMC(BaseMcRuntime mcEng)
        {
            if (McObjectList == null)
                this.McObjectList = new List<BaseMcRuntime>();
            this.McObjectList.Add(mcEng);
        }

        public string[] ListMessageLog()
        {
            return this.McObjectList.Select(x => x.Code + " > " + x.MessageLog).ToArray();
        }

        public BaseMcRuntime GetMcRuntimeByLocation(string curLocCode)
        {
            var curLoc = StaticValueManager.GetInstant().GetLocation(curLocCode);
            return this.McObjectList.FirstOrDefault(x => x.McObj.Cur_Location_ID == curLoc.ID);
        }
        public BaseMcRuntime GetMcRuntime(string mcCode)
        {
            return this.McObjectList.FirstOrDefault(x => x.Code == mcCode);
        }
        public BaseMcRuntime GetMcRuntime(long mcID)
        {
            return this.McObjectList.FirstOrDefault(x => x.ID == mcID);
        }

        public void PostCommand(string mcCode, McCommandType command, ListKeyValue<string,object> parameters, Action<BaseMcRuntime> callback_OnChange)
        {
            this.GetMcRuntime(mcCode).PostCommand(command, parameters, callback_OnChange);
        }

        public T GetDeviceValue<T>(string mcCode, string key)
        {
            return this.GetMcRuntime(mcCode).McObj.Get2<T>("DV_" + key);
        }
        public bool IsIDEL(string mcCode)
        {
            return this.GetMcRuntime(mcCode).McObj.EventStatus == McObjectEventStatus.IDEL;
        }
    }
}
