using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Criteria;
using System.Text.RegularExpressions;

namespace AWMSEngine.ADO.StaticValue
{
    public class StaticValueManager : IStaticValueManager
    {
        private Dictionary<string, ams_Feature> _Features;
        public Dictionary<string, ams_Feature> Features { get => this._Features; }

        private Dictionary<string, ams_Config> _Configs;
        public Dictionary<string, ams_Config> Configs { get => this._Configs; }

        private List<ams_ObjectSize> _ObjectSizes;
        public List<ams_ObjectSize> ObjectSizes { get => this._ObjectSizes; }

        private List<ams_Branch> _Branchs;
        public List<ams_Branch> Branchs { get => this._Branchs; }
        public ams_Branch GetBranch(long? branchID, long? warehouseID, long? areaID,
            string branchCode, string warehouseCode, string areaCode)
        {
            ams_Branch b = null;
            ams_Warehouse w = GetWarehouse(warehouseID, areaID, warehouseCode, areaCode);
            if (branchID.HasValue || !string.IsNullOrEmpty(branchCode) || w != null)
            {
                b = this.Branchs.FirstOrDefault(x => 
                x.ID == branchID || 
                (!branchID.HasValue && x.Code == branchCode) ||
                (!branchID.HasValue && string.IsNullOrWhiteSpace(branchCode) && w != null && x.ID == w.Branch_ID));
                if (b == null)
                    throw new Exception("รหัส branch ไม่ถูกต้อง");
                else if (w != null && w.Branch_ID != b.ID)
                    throw new Exception("รหัส Warehouses ไม่สัมพันธ์กับ Branch");
            }

            return b;
        }

        private List<ams_Warehouse> _Warehouses;
        public List<ams_Warehouse> Warehouses { get => this._Warehouses; }
        public ams_Warehouse GetWarehouse(long? warehouseID, long? areaID,
            string warehouseCode, string areaCode)
        {
            ams_Warehouse w = null;
            ams_AreaMaster a = GetAreaMaster(areaID, areaCode);
            if (warehouseID.HasValue || !string.IsNullOrEmpty(warehouseCode) || a != null)
            {
                w = this.Warehouses.FirstOrDefault(x =>
                x.ID == warehouseID ||
                (!warehouseID.HasValue && x.Code == warehouseCode) ||
                (!warehouseID.HasValue && string.IsNullOrWhiteSpace(warehouseCode) && w != null && x.ID == a.Warehouse_ID));
                if (w == null)
                    throw new Exception("รหัส Warehouses ไม่ถูกต้อง");
                else if (a != null && a.Warehouse_ID != w.ID)
                    throw new Exception("รหัส Area ไม่สัมพันธ์กับ Warehouses");
            }

            return w;
        }

        private List<ams_AreaMaster> _AreaMasters;
        public List<ams_AreaMaster> AreaMasters { get => this._AreaMasters; }
        public ams_AreaMaster GetAreaMaster(long? areaID, string areaCode)
        {
            ams_AreaMaster a = null;
            if (areaID.HasValue || !string.IsNullOrEmpty(areaCode))
            {
                a = this.AreaMasters.FirstOrDefault(x => 
                x.ID == areaID ||
                (!areaID.HasValue && x.Code == areaCode));
                if (a == null)
                    throw new Exception("รหัส Area ไม่ถูกต้อง");
            }

            return a;
        }
      

        private List<ams_AreaMasterType> _AreaMasterTypes;
        public List<ams_AreaMasterType> AreaMasterTypes { get => this._AreaMasterTypes; }
        private List<ams_AreaRoute> _AreaMasterLines;
        public List<ams_AreaRoute> AreaMasterLines { get => this._AreaMasterLines; }

        private List<ams_Supplier> _Suppliers;
        public List<ams_Supplier> Suppliers { get => this._Suppliers; }

        private List<ams_Customer> _Customers;
        public List<ams_Customer> Customers { get => this._Customers; }

        private List<ams_PackMasterType> _PackMasterTypes;
        public List<ams_PackMasterType> PackMasterTypes { get => this._PackMasterTypes; }

        private List<ams_PackMaster> _PackMasterEmptyPallets;
        public List<ams_PackMaster> PackMasterEmptyPallets { get => this._PackMasterEmptyPallets; }

        private List<ams_SKUMasterType> _SKUMasterTypes;
        public List<ams_SKUMasterType> SKUMasterTypes { get => this._SKUMasterTypes; }

        private List<ams_SKUMaster> _SKUMasterEmptyPallets;
        public List<ams_SKUMaster> SKUMasterEmptyPallets { get => this._SKUMasterEmptyPallets; }

        private List<ams_APIService> _APIServices;
        public List<ams_APIService> APIServices { get => this._APIServices; }

        private List<ams_Transport> _Transports;
        public List<ams_Transport> Transports { get => this._Transports; }

        private List<ams_UnitType> _UnitTypes;
        public List<ams_UnitType> UnitTypes { get => this._UnitTypes; }

        private List<amv_PackUnitConvert> _PackUnitConverts;
        public List<amv_PackUnitConvert> PackUnitConverts { get => this._PackUnitConverts; }

        public ConvertUnitCriteria ConvertToNewUnitBySKU(long skuID, decimal qty, long oldUnitTypeID, long newUnitTypeID)
        {
            var oldUnit = this._PackUnitConverts.Find(x => x.SKUMaster_ID == skuID && x.UnitType_ID == oldUnitTypeID);
            var newUnit = this._PackUnitConverts.Find(x => x.SKUMaster_ID == skuID && x.UnitType_ID == newUnitTypeID);
            if (newUnit == null || oldUnit == null)
                throw new Exception("Covert Unit Fail : UnitType ไม่มีใน Config PackMaster");

            //var baseUnit = this.ConvertToBaseUnitBySKU(skuID, qty, oldUnitTypeID);
            return new ConvertUnitCriteria()
            {
                skuMaster_ID = newUnit.SKUMaster_ID,
                skuMaster_Code = newUnit.SKUMaster_Code,
                packMaster_ID = newUnit.PackMaster_ID,
                packMaster_Code = newUnit.PackMaster_Code,
                qty = (qty * oldUnit.BaseQuantity / oldUnit.Quantity) * newUnit.Quantity / newUnit.BaseQuantity,
                unitType_ID = newUnit.UnitType_ID,
                baseQty = (qty * oldUnit.BaseQuantity / oldUnit.Quantity),
                baseUnitType_ID = oldUnit.BaseUnitType_ID,
                weiKg = newUnit.WeightKG * (qty * oldUnit.BaseQuantity / oldUnit.Quantity) / newUnit.BaseQuantity
            };
        }

        public ConvertUnitCriteria ConvertToBaseUnitBySKU(long skuID, decimal qty, long oldUnitTypeID)
        {
            var baseUnitID = this._PackUnitConverts.First(x => x.SKUMaster_ID == skuID).BaseUnitType_ID;
            var convertUnit = this.ConvertToNewUnitBySKU(skuID, qty, oldUnitTypeID, baseUnitID);
            return convertUnit;
        }
        public ConvertUnitCriteria ConvertToBaseUnitBySKU(string skuCode, decimal qty, long oldUnitTypeID)
        {
            int skuID = this._PackUnitConverts.First(x => x.SKUMaster_Code == skuCode).SKUMaster_ID;
            return this.ConvertToBaseUnitBySKU(skuID, qty, oldUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToBaseUnitByPack(string packCode, decimal qty, long oldUnitTypeID)
        {
            int skuID = this._PackUnitConverts.First(x => x.PackMaster_Code == packCode).SKUMaster_ID;
            return this.ConvertToBaseUnitBySKU(skuID, qty, oldUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToBaseUnitByPack(long packID, decimal qty, long oldUnitTypeID)
        {
            int skuID = this._PackUnitConverts.First(x => x.PackMaster_ID == packID).SKUMaster_ID;
            return this.ConvertToBaseUnitBySKU(skuID, qty, oldUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToNewUnitBySKU(string skuCode, decimal qty, long oldUnitTypeID, long newUnitTypeID)
        {
            var skuID = this._PackUnitConverts.First(x => x.SKUMaster_Code == skuCode).SKUMaster_ID;
            return this.ConvertToNewUnitBySKU(skuID, qty, oldUnitTypeID, newUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToNewUnitByPack(string packCode, decimal qty, long oldUnitTypeID, long newUnitTypeID)
        {
            int skuID = this._PackUnitConverts.First(x => x.PackMaster_Code == packCode).SKUMaster_ID;
            return this.ConvertToNewUnitBySKU(skuID, qty, oldUnitTypeID, newUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToNewUnitByPack(long packID, decimal qty, long oldUnitTypeID, long newUnitTypeID)
        {
            int skuID = this._PackUnitConverts.First(x => x.PackMaster_ID == packID).SKUMaster_ID;
            return this.ConvertToNewUnitBySKU(skuID, qty, oldUnitTypeID, newUnitTypeID);
        }


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
            foreach (var md in this.GetType().GetMethods())
            {
                if (md.Name.StartsWith("Load") && md.Name != "LoadAll")
                {
                    md.Invoke(this, new object[] { null });
                }
            }
        }
        public void LoadFeature(VOCriteria buVO = null)
        {
            this._Features = new Dictionary<string, ams_Feature>();
            ADO.DataADO.GetInstant().SelectBy<ams_Feature>("status", 1, buVO ?? new VOCriteria()).ForEach(x => this._Features.Add(x.Code, x));
        }
        public void LoadConfig(VOCriteria buVO = null)
        {
            this._Configs = new Dictionary<string, ams_Config>();
            ADO.DataADO.GetInstant().SelectBy<ams_Config>("status", 1, buVO ?? new VOCriteria()).ForEach(x => this._Configs.Add(x.Code, x));
        }
        public void LoadObjectSize(VOCriteria buVO = null)
        {
            this._ObjectSizes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_ObjectSize>("status", 1, buVO ?? new VOCriteria()));
            var subVals = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_ObjectSizeMap>("status", 1, buVO ?? new VOCriteria()));
            this._ObjectSizes.ForEach(x => x.ObjectSizeInners = subVals.FindAll(y => y.OuterObjectSize_ID == x.ID));
        }
        public void LoadPackMaster(VOCriteria buVO = null)
        {
            this._PackUnitConverts = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<amv_PackUnitConvert>(new SQLConditionCriteria[] { }, buVO ?? new VOCriteria()));
        }
        public void LoadUnitType(VOCriteria buVO = null)
        {
            this._UnitTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_UnitType>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadAreaMaster(VOCriteria buVO = null)
        {
            this._AreaMasters = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_AreaMaster>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadAreaRoute(VOCriteria buVO = null)
        {
            this._AreaMasterLines = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_AreaRoute>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadAreaMasterType(VOCriteria buVO = null)
        {
            this._AreaMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_AreaMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadWarehouse(VOCriteria buVO = null)
        {
            this._Warehouses = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Warehouse>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadBranch(VOCriteria buVO = null)
        {
            this._Branchs = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Branch>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadCustomer(VOCriteria buVO = null)
        {
            this._Customers = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Customer>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadSupplier(VOCriteria buVO = null)
        {
            this._Suppliers = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Supplier>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadPackMasterType(VOCriteria buVO = null)
        {
            this._PackMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_PackMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadAPIService(VOCriteria buVO = null)
        {
            this._APIServices = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_APIService>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadSKUMasterType(VOCriteria buVO = null)
        {
            this._SKUMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadTransport(VOCriteria buVO = null)
        {
            this._Transports = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Transport>("status", 1, buVO ?? new VOCriteria()));
        }
        public void LoadPackMasterEmptyPallets(VOCriteria buVO = null)
        {
            var packtype = ADO.DataADO.GetInstant().SelectBy<ams_PackMasterType>("Code", "EMPTYPALLET", buVO ?? new VOCriteria()).FirstOrDefault();
            if (packtype != null)
            {
                this._PackMasterEmptyPallets = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("PackMasterType_ID", packtype.ID.Value,
                            SQLOperatorType.EQUALS, SQLConditionType.AND)
                      }, buVO ?? new VOCriteria()));
            }
            else
            {
                this._PackMasterEmptyPallets = null;
            }
        }
        public void LoadSKUMasterEmptyPallets(VOCriteria buVO = null)
        {
            var skutype = ADO.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("Code", "EMPTYPALLET", buVO ?? new VOCriteria()).FirstOrDefault();
            if (skutype != null)
            {
                this._SKUMasterEmptyPallets = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("SKUMasterType_ID",
                            ADO.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("Code", "EMPTYPALLET", buVO ?? new VOCriteria()).FirstOrDefault().ID.Value,
                            SQLOperatorType.EQUALS, SQLConditionType.AND)
                      }, buVO ?? new VOCriteria()));
            }
            else
            {
                this._SKUMasterEmptyPallets = null;
            }
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
            return GetConfig(code.ToString());
        }
        public string GetConfig(string code)
        {
            string c = code;
            return this._Configs.ContainsKey(c) ? this._Configs[c].DataValue : null;
        }
        public T GetEntity<T>(long? id, string code)
            where T : BaseEntitySTD
        {
            string propName = typeof(T).Name.Split('.').Last().Substring(4)+"s";
            var lis = (List<T>)this.GetType().GetProperty(propName).GetValue(this, null);
            var e = lis.FindAll(x => x.ID == id || x.Code == code);
            var e1 = e.FirstOrDefault();
            if (e1 == null)
                return null;
            if (e.Count() > 1)
                throw new Exception("ข้อมูล" + propName + "ซ้ำซ้อน");
            if (!string.IsNullOrWhiteSpace(code) && e1.Code != code)
                throw new Exception("รหัสของ " + propName + " ไม่ถูกต้อง");
            if (id.HasValue && e1.ID != id)
                throw new Exception("ID ของ " + propName + " ไม่ถูกต้อง");
            return e1;

        }
        public bool IsMatchConfigArray(string code, object value)
        {
            string v = value.ToString();
            return Regex.IsMatch(this.GetConfig(code), string.Format("^{0}$|^{0},|,{0},|,{0}$", v));
        }
        public EntityStatus? GetStatusInConfigByEventStatus<T>(T? value)
            where T : struct, IComparable, IFormattable, IConvertible
        {
            if (!value.HasValue) return null;
            string fixCode = value is StorageObjectEventStatus ? "STO" :
                                (value is DocumentEventStatus) ? "DOC" :
                                (value is WorkQueueEventStatus) ? "Q" : string.Empty;
            int v = AMWUtil.Common.EnumUtil.GetValueInt(value.Value);
            if (this.IsMatchConfigArray("ESTS_" + fixCode + "_FOR_INACTIVE", v))
                return EntityStatus.INACTIVE;
            if (this.IsMatchConfigArray("ESTS_" + fixCode + "_FOR_ACTIVE", v))
                return EntityStatus.ACTIVE;
            if (this.IsMatchConfigArray("ESTS_" + fixCode + "_FOR_REMOVE", v))
                return EntityStatus.REMOVE;
            if (this.IsMatchConfigArray("ESTS_" + fixCode + "_FOR_DONE", v))
                return EntityStatus.DONE;
            throw new Exception("EventStatus '" + value ?? "" + "' Convert To EntityStatus Not Config");
        }
    }
}
