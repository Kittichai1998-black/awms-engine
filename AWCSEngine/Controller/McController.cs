using AMSModel.Constant.EnumConst;
using AWCSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Controller
{
    public class McController
    {

        private static McController instant;
        public static McController GetInstant()
        {
            if (McController.instant == null)
                McController.instant = new McController();
            return McController.instant;
        }


        private List<BaseMcEngine> McObjectList { get; set; }
        private McController()
        {
            this.McObjectList = new List<BaseMcEngine>();
        }

        public void AddMC(BaseMcEngine mcEng)
        {
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

        public void Command(string mcCode, McCommand command, string locCode)
        {
            //this.GetMcObject(mcCode).
        }
    }
}
