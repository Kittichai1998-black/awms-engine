using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Criteria;

namespace AWMSEngine.ADO.StaticValue
{
    public class StaticValueManager
    {
        private List<ams_Feature> _Features;
        public List<ams_Feature> Features { get => this._Features; }

        private List<ams_Config> _Configs;
        public List<ams_Config> Configs { get => this._Configs; }

        private List<ams_ObjectSize> _ObjectSizes;
        public List<ams_ObjectSize> ObjectSizes { get => this._ObjectSizes; }

        private static StaticValueManager instant;

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
            this.LoadObjectSize();
        }
        public void LoadFeature()
        {
            this._Features = ADO.DataADO.GetInstant().SelectBy<ams_Feature>("status", 1, new VOCriteria()).ToList();
        }
        public void LoadConfig()
        {
            this._Configs = ADO.DataADO.GetInstant().SelectBy<ams_Config>("status", 1, new VOCriteria()).ToList();
        }
        public void LoadObjectSize()
        {
            this._ObjectSizes = ADO.DataADO.GetInstant().SelectBy<ams_ObjectSize>("status", 1, new VOCriteria()).ToList();
            var subVals = ADO.DataADO.GetInstant().SelectBy<ams_ObjectSizeMap>("status", 1, new VOCriteria()).ToList();
            this._ObjectSizes.ForEach(x => x.ObjectSizeInners = subVals.FindAll(y => y.OuterObjectSize_ID == x.ID));
        }

        public string GetFeature(FeatureCode code)
        {
            var val = this._Features.FirstOrDefault(x => x.Code == code.ToString());
            return val == null ? null : val.DataValue;
        }
        public string GetConfig(ConfigCode code)
        {
            var val = this._Configs.FirstOrDefault(x => x.Code == code.ToString());
            return val == null ? null : val.DataValue;
        }
    }
}
