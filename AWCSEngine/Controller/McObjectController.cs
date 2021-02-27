using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Engine;
using AWCSEngine.Engine.McObjectEngine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Controller
{
    public class McObjectController : BaseController<McObjectController>
    {


        private List<BaseMcEngine> McObjectList { get; set; }

        public void AddMC(BaseMcEngine mcEng)
        {
            if (McObjectList == null)
                this.McObjectList = new List<BaseMcEngine>();
            this.McObjectList.Add(mcEng);
        }

        public string[] ListMessageLog()
        {
            return this.McObjectList.Select(x => x.Code + " > " + x.MessageLog).ToArray();
        }

        public BaseMcEngine GetMcObject(string mcCode)
        {
            return this.McObjectList.FirstOrDefault(x => x.Code == mcCode);
        }
        public BaseMcEngine GetMcObject(int mcID)
        {
            return this.McObjectList.FirstOrDefault(x => x.ID == mcID);
        }

        public void PostCommand(string mcCode, McCommandType command, ListKeyValue<string,object> parameters, Action<BaseMcEngine> callback_OnChange)
        {
            this.GetMcObject(mcCode).PostCommand(command, parameters, callback_OnChange);
        }

        public T GetDeviceValue<T>(string mcCode, string key)
        {
            return this.GetMcObject(mcCode).McObj.Get2<T>("DV_" + key);
        }
        public bool IsIDEL(string mcCode)
        {
            return this.GetMcObject(mcCode).McObj.EventStatus == McObjectEventStatus.IDEL;
        }
    }
}
