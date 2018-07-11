using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;

namespace AWMSEngine.ADO.StaticValue
{
    public class StaticValueManager
    {
        private const string KEY_FEATURE = "FEATURE";
        private const string KEY_CONFIG = "CONFIG";
        private static StaticValueManager instant;
        private Dictionary<string, Dictionary<string, string>> StaticValues { get; set; }

        public static StaticValueManager GetInstant()
        {
            if (instant == null)
                instant = new StaticValueManager();
            return instant;
        }
        private StaticValueManager()
        {
            this.LoadAll();
        }
        public void LoadAll()
        {
            this.LoadConfig();
            this.LoadFeature();
        }
        public void LoadFeature()
        {
            if (this.StaticValues.ContainsKey(KEY_FEATURE))
                this.StaticValues.Remove(KEY_FEATURE);
            var confs = new Dictionary<string, string>();
            this.StaticValues.Add(KEY_FEATURE, confs);
            ADO.DataADO.GetInstant().SelectBy<ams_Feature>("status", 1)
                .ForEach(x => confs.Add(x.Code, x.DataValue));
        }
        public void LoadConfig()
        {
            if (this.StaticValues.ContainsKey(KEY_FEATURE))
                this.StaticValues.Remove(KEY_CONFIG);
            var confs = new Dictionary<string, string>();
            this.StaticValues.Add(KEY_FEATURE, confs);
            ADO.DataADO.GetInstant().SelectBy<ams_Config>("status", 1)
                .ForEach(x => confs.Add(x.Code, x.DataValue));
        }

        public string GetFeature(FeatureCode code)
        {
            return this.StaticValues[KEY_FEATURE][code.ToString()];
        }
        public string GetConfig(ConfigCode code)
        {
            return this.StaticValues[KEY_CONFIG][code.ToString()];
        }
    }
}
