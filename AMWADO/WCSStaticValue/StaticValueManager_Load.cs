using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WCSStaticValue
{
    public partial class StaticValueManager
    {
        public List<acs_Config> LoadConfig(VOCriteria buVO = null)
        {
            return this._Configs = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_Config>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_McMaster> LoadMcMaster(VOCriteria buVO = null)
        {
            return this._McMasters = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McMaster>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_McCommand> LoadMcCommand(VOCriteria buVO = null)
        {
            return this._McCommands = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McCommand>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_McCommandMcMaster> LoadMcCommandMcMaster(VOCriteria buVO = null)
        {
            return this._McCommandMcMasters = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McCommandMcMaster>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_McCommandAction> LoadMcCommandRegistry(VOCriteria buVO = null)
        {
            return this._McCommandRegistrys = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McCommandAction>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_Location> LoadLocation(VOCriteria buVO = null)
        {
            return this._Locations = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_Location>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_LocationRoute> LoadLocationRoute(VOCriteria buVO = null)
        {
            return this._LocationRoutes = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_LocationRoute>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_APIFileService> LoadAPIFileService(VOCriteria buVO = null)
        {
            return this._APIFiles = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_APIFileService>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_BotService> LoadBotService(VOCriteria buVO = null)
        {
            return this._BotService = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_BotService>("status", 1, buVO ?? new VOCriteria());
        }


    }
}
