using AMSModel.Constant.EnumConst;
using AMWUtil.Exception;
using AWCSEngine.Engine;
using AWCSEngine.Engine.McObjectEngine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Controller
{
    public class McController : BaseController<McController>
    {


        private List<BaseMcObjectEngine> McObjectList { get; set; }

        public void AddMC(BaseMcObjectEngine mcEng)
        {
            if (McObjectList == null)
                this.McObjectList = new List<BaseMcObjectEngine>();
            this.McObjectList.Add(mcEng);
        }

        public string[] ListMessageLog()
        {
            return this.McObjectList.Select(x => x.Code + " > " + x.MessageLog).ToArray();
        }

        public BaseMcObjectEngine GetMcObject(string mcCode)
        {
            return this.McObjectList.FirstOrDefault(x => x.Code == mcCode);
        }
        public BaseMcObjectEngine GetMcObject(int mcID)
        {
            return this.McObjectList.FirstOrDefault(x => x.ID == mcID);
        }

        public void Command(string mcCode, McCommand command, string souLocCode, string desLocCode)
        {
            this.GetMcObject(mcCode).Command(command, souLocCode, desLocCode);
        }
    }
}
