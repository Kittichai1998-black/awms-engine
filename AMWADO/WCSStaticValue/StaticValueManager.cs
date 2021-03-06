using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMSModel.Criteria;
using System.Text.RegularExpressions;
using AMWUtil.Exception;

namespace ADO.WCSStaticValue
{
    public partial class StaticValueManager
    {
        private List<acs_Config> _Configs;
        public List<acs_Config> Configs { get => this._Configs ?? this.LoadConfig(); }
        private List<acs_McCommand> _McCommands;
        public List<acs_McCommand> McCommands { get => this._McCommands ?? this.LoadMcCommand(); }
        private List<acs_McCommandMcMaster> _McCommandMcMasters;
        public List<acs_McCommandMcMaster> McCommandMcMasters { get => this._McCommandMcMasters ?? this.LoadMcCommandMcMaster(); }
        private List<acs_McCommandAction> _McCommandRegistrys;
        public List<acs_McCommandAction> McCommandRegistrys { get => this._McCommandRegistrys ?? this.LoadMcCommandRegistry(); }
        private List<acs_McMaster> _McMasters;
        public List<acs_McMaster> McMasters { get => this._McMasters ?? this.LoadMcMaster(); }
        private List<acs_Warehouse> _Warehouses;
        public List<acs_Warehouse> Warehouses { get => this._Warehouses ?? this.LoadWarehouse(); }
        private List<acs_Area> _Areas;
        public List<acs_Area> Areas { get => this._Areas ?? this.LoadArea(); }
        private List<acs_Location> _Locations;
        public List<acs_Location> Locations { get => this._Locations ?? this.LoadLocation(); }
        private List<acs_LocationRoute> _LocationRoutes;
        public List<acs_LocationRoute> LocationRoutes { get => this._LocationRoutes ?? this.LoadLocationRoute(); }
        private List<acs_APIFileService> _APIFiles;
        public List<acs_APIFileService> APIFiles { get => this._APIFiles ?? this.LoadAPIFileService(); }
        private List<acs_WorkService> _WorkServices;
        public List<acs_WorkService> WorkServices { get => this._WorkServices ?? this.LoadWorkService(); }

        private static StaticValueManager instant;

        public static StaticValueManager GetInstant()
        {
            if (instant == null)
                instant = new StaticValueManager();
            return instant;
        }
        private StaticValueManager()
        {
            //this.LoadAll();
        }
        public void LoadAll()
        {
            foreach (var md in this.GetType().GetMethods())
            {
                if (md.Name.StartsWith("Load") && md.Name != "LoadAll")
                {
                    md.Invoke(this, new object[] { null });
                }
            }
        }


        public void ClearStaticByTableName(string tableName)
        {
            if (tableName.StartsWith("acs_"))
            {
                if (tableName == typeof(ams_Config).Name) this._Configs = null;
            }
        }




        // New Convert

        private class dataConvert 
        {
            public class convertList
            {
                public long unitType_C1;
                public decimal qty_C1;
                public long unitType_C2;
                public decimal qty_C2;
            }
            public List<convertList> covertLists;

        };



    }
}
