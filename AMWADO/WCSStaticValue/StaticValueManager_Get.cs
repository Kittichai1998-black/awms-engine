﻿using AMWUtil.Common;
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
        public acs_McCommand GetMcCommand(long mcComID)
        {
            return this.McCommands.FindAll(x => x.ID == mcComID).FirstOrDefault();
        }
        public acs_McCommand GetMcCommand(long mcMstID, McCommandType cmdType)
        {
            var mccm = this.McCommandMcMasters.FindAll(x => x.McMaster_ID == mcMstID);
            return this.McCommands.FirstOrDefault(x => x.McCommandType == cmdType && mccm.Any(y => y.McCommand_ID == x.ID));
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
        public acs_Area GetArea(long id)
        {
            return this.Areas.FirstOrDefault(x => x.ID == id);
        }
        public acs_Area GetArea(string code)
        {
            return this.Areas.FirstOrDefault(x => x.Code == code);
        }
        public acs_Warehouse GeWarehouse(long id)
        {
            return this.Warehouses.FirstOrDefault(x => x.ID == id);
        }
        public acs_Warehouse GetWarehouse(string code)
        {
            return this.Warehouses.FirstOrDefault(x => x.Code == code);
        }
        public List<acs_Location> ListLocationByWarehouse(long whID)
        {
            var areaIds = this.Areas.FindAll(x => x.Warehouse_ID == whID).Select(x => x.ID.Value);
            return this.Locations.FindAll(x => areaIds.Contains(x.Area_ID));
        }
        public List<acs_Location> ListLocationByWarehouse(string whCode)
        {
            var areaIds = this.Areas.FindAll(x => x.Code == whCode).Select(x => x.ID.Value);
            return this.Locations.FindAll(x => areaIds.Contains(x.Area_ID));
        }
        public acs_Location GetLocation(long id)
        {
            return this.Locations.FirstOrDefault(x => x.ID == id);
        }
        public acs_Location GetLocation(string code)
        {
            return this.Locations.FirstOrDefault(x => x.Code == code);
        }
        public List<acs_Location> GetLocations(List<string> codes)
        {
            return this.Locations.FindAll(x => codes.Contains(x.Code));
        }
        public acs_APIFileService GetAPIFile(long id)
        {
            return this.APIFiles.FirstOrDefault(x => x.ID == id);
        }
        public acs_APIFileService GetAPIFile(string code)
        {
            return this.APIFiles.FirstOrDefault(x => x.Code == code);
        }
        public acs_WorkService GetWorkService(long id)
        {
            return this.WorkServices.FirstOrDefault(x => x.ID == id);
        }
        public acs_WorkService GetBotService(string code)
        {
            return this.WorkServices.FirstOrDefault(x => x.Code == code);
        }
    }
}
