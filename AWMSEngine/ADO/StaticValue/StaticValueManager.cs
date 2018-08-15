﻿using AWMSModel.Constant.EnumConst;
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
        private Dictionary<string, ams_Feature> _Features;
        public Dictionary<string, ams_Feature> Features { get => this._Features; }

        private Dictionary<string, ams_Config> _Configs;
        public Dictionary<string, ams_Config> Configs { get => this._Configs; }

        private List<ams_ObjectSize> _ObjectSizes;
        public List<ams_ObjectSize> ObjectSizes { get => this._ObjectSizes; }

        private List<ams_Branch> _Branch;
        public List<ams_Branch> Branchs { get => this._Branch; }
        private List<ams_Warehouse> _Warehouses;
        public List<ams_Warehouse> Warehouses { get => this._Warehouses; }
        private List<ams_AreaMaster> _AreaMaster;
        public List<ams_AreaMaster> AreaMasters { get => this._AreaMaster; }

        private List<ams_Supplier> _Supplier;
        public List<ams_Supplier> Supplier { get => this._Supplier; }
        private List<ams_Dealer> _Dealer;
        public List<ams_Dealer> Dealer { get => this._Dealer; }

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
            this.LoadWarehouses();
            this.LoadAreaMaster();
            this.LoadBranch();
            this.LoadSupplier();
            this.LoadDealer();
        }
        public void LoadFeature()
        {
            this._Features = new Dictionary<string, ams_Feature>();
            ADO.DataADO.GetInstant().SelectBy<ams_Feature>("status", 1, new VOCriteria()).ForEach(x => this._Features.Add(x.Code, x));
        }
        public void LoadConfig()
        {
            this._Configs = new Dictionary<string, ams_Config>();
            ADO.DataADO.GetInstant().SelectBy<ams_Config>("status", 1, new VOCriteria()).ForEach(x => this._Configs.Add(x.Code, x));
        }
        public void LoadObjectSize()
        {
            this._ObjectSizes = ADO.DataADO.GetInstant().SelectBy<ams_ObjectSize>("status", 1, new VOCriteria()).ToList();
            var subVals = ADO.DataADO.GetInstant().SelectBy<ams_ObjectSizeMap>("status", 1, new VOCriteria()).ToList();
            this._ObjectSizes.ForEach(x => x.ObjectSizeInners = subVals.FindAll(y => y.OuterObjectSize_ID == x.ID));
        }
        public void LoadAreaMaster()
        {
            this._AreaMaster = ADO.DataADO.GetInstant().SelectBy<ams_AreaMaster>("status", 1, new VOCriteria()).ToList();
        }
        public void LoadWarehouses()
        {
            this._Warehouses = ADO.DataADO.GetInstant().SelectBy<ams_Warehouse>("status", 1, new VOCriteria()).ToList();
        }
        public void LoadBranch()
        {
            this._Branch = ADO.DataADO.GetInstant().SelectBy<ams_Branch>("status", 1, new VOCriteria()).ToList();
        }
        public void LoadDealer()
        {
            this._Dealer = ADO.DataADO.GetInstant().SelectBy<ams_Dealer>("status", 1, new VOCriteria()).ToList();
        }
        public void LoadSupplier()
        {
            this._Supplier = ADO.DataADO.GetInstant().SelectBy<ams_Supplier>("status", 1, new VOCriteria()).ToList();
        }

        public bool IsFeature(FeatureCode code)
        {
            string c = code.ToString();
            return this._Features.ContainsKey(c) ? 
                this._Features[c].DataValue != AWMSModel.Constant.StringConst.YesNoConst.NO : false;
        }
        public string GetFeatureValue(FeatureCode code)
        {
            string c = code.ToString();
            return this._Features.ContainsKey(c) ? this._Features[c].DataValue : null;
        }
        public string GetConfig(ConfigCode code)
        {
            string c = code.ToString();
            return this._Configs.ContainsKey(c) ? this._Configs[c].DataValue : null;
        }
    }
}
