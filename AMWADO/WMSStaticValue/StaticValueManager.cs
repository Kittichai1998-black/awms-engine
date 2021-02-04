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
        private List<acs_McRegistry> _McRegistry;

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
