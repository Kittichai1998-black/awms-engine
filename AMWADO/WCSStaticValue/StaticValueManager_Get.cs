using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ADO.WCSStaticValue
{
    public partial class StaticValueManager
    {
        public string GetConfigValue(string key)
        {
            return this.Configs.First(x => x.DataKey == key).DataValue;
        }
        public acs_Config GetConfig(string key)
        {
            return this.Configs.FirstOrDefault(x => x.DataKey == key);
        }
        public acs_McMaster GetMcMaster(string code)
        {
            return this.McMasters.FirstOrDefault(x => x.Code == code);
        }
        public acs_McCommand GetMcCommand(long mcMstID, McCommandType cmdType)
        {
            var mccm = this.McCommandMcMasters.FindAll(x => x.McMaster_ID == mcMstID);
            return this.McCommands.FirstOrDefault(x => x.McCommandType == cmdType && mccm.Any(y => y.McMaster_ID == x.ID));
        }
        public List<acs_McCommand> ListMcCommand(long mcMstID)
        {
            var mccm = this.McCommandMcMasters.FindAll(x => x.McMaster_ID == mcMstID);
            return this.McCommands.FindAll(x => mccm.Any(y => y.McMaster_ID == x.ID));
        }
        public List<acs_McCommandAction> ListMcCommandAction(long cmdID)
        {
            return this.McCommandRegistrys.FindAll(x => x.McCommand_ID == cmdID);
        }
        public acs_Location GetLocation(long id)
        {
            return this.Locations.FirstOrDefault(x => x.ID == id);
        }
        public acs_Location GetLocation(string code)
        {
            return this.Locations.FirstOrDefault(x => x.Code == code);
        }
        public acs_APIFileService GetAPIFile(long id)
        {
            return this.APIFiles.FirstOrDefault(x => x.ID == id);
        }
        public acs_APIFileService GetAPIFile(string code)
        {
            return this.APIFiles.FirstOrDefault(x => x.Code == code);
        }
        public acs_WorkService GetBotService(long id)
        {
            return this.BotService.FirstOrDefault(x => x.ID == id);
        }
        public acs_WorkService GetBotService(string code)
        {
            return this.BotService.FirstOrDefault(x => x.Code == code);
        }
    }
}
