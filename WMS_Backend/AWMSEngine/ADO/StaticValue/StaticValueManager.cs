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
        private List<ams_Feature> _Features;
        public List<ams_Feature> Features { get => this._Features ?? this.LoadFeature(); }

        private List<ams_Config> _Configs;
        public List<ams_Config> Configs { get => this._Configs ?? this._Configs; }

        private List<ams_ObjectSize> _ObjectSizes;
        public List<ams_ObjectSize> ObjectSizes { get => this._ObjectSizes ?? this.LoadObjectSize(); }

        private List<ams_Branch> _Branchs;
        public List<ams_Branch> Branchs { get => this._Branchs ?? this.LoadBranch(); }
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
        public List<ams_Warehouse> Warehouses { get => this._Warehouses ?? this.LoadWarehouse(); }
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
        public string GetWarehousesCode(long id)
        {
            return this._Warehouses.First(x => x.ID == id).Code;
        }

        private List<ams_AreaMaster> _AreaMasters;
        public List<ams_AreaMaster> AreaMasters { get => this._AreaMasters ?? this.LoadAreaMaster(); }
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
        public string GetAreaMasterCode(long id)
        {
            return this._AreaMasters.First(x => x.ID == id).Code;
        }

        private List<ams_AreaMasterType> _AreaMasterTypes;
        public List<ams_AreaMasterType> AreaMasterTypes { get => this._AreaMasterTypes ?? this.LoadAreaMasterType(); }
        public string GetAreaMasterTypesCode(long id)
        {
            return this._AreaMasterTypes.First(x => x.ID == id).Code;
        }

        private List<ams_AreaRoute> _AreaRoutes;
        public List<ams_AreaRoute> AreaRoutes { get => this._AreaRoutes ?? this.LoadAreaRoute(); }

        private List<ams_Supplier> _Suppliers;
        public List<ams_Supplier> Suppliers { get => this._Suppliers ?? this.LoadSupplier(); }

        private List<ams_Customer> _Customers;
        public List<ams_Customer> Customers { get => this._Customers ?? this.LoadCustomer(); }

        private List<ams_PackMasterType> _PackMasterTypes;
        public List<ams_PackMasterType> PackMasterTypes { get => this._PackMasterTypes ?? this.LoadPackMasterType(); }

        private List<ams_PackMaster> _PackMasterEmptyPallets;
        public List<ams_PackMaster> PackMasterEmptyPallets { get => this._PackMasterEmptyPallets ?? this.LoadPackMasterEmptyPallets(); }

        private List<ams_SKUMasterType> _SKUMasterTypes;
        public List<ams_SKUMasterType> SKUMasterTypes { get => this._SKUMasterTypes ?? this.LoadSKUMasterType(); }

        private List<ams_SKUMaster> _SKUMasterEmptyPallets;
        public List<ams_SKUMaster> SKUMasterEmptyPallets { get => this._SKUMasterEmptyPallets ?? this.LoadSKUMasterEmptyPallets(); }

        private List<ams_APIService> _APIServices;
        public List<ams_APIService> APIServices { get => this._APIServices ?? this.LoadAPIService(); }

        private List<ams_Transport> _Transports;
        public List<ams_Transport> Transports { get => this._Transports ?? this.LoadTransport(); }

        private List<ams_UnitType> _UnitTypes;
        public List<ams_UnitType> UnitTypes { get => this._UnitTypes ?? this.LoadUnitType(); }

        private List<amv_PackUnitConvert> _PackUnitConverts;
        public List<amv_PackUnitConvert> PackUnitConverts { get => this._PackUnitConverts ?? this.LoadPackUnitConvert(); }

        private List<ams_BaseMasterType> _BaseMasterTypes;
        public List<ams_BaseMasterType> BaseMasterTypes { get => this._BaseMasterTypes ?? this.LoadBaseMasterType(); }

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

        public List<ams_Feature> LoadFeature(VOCriteria buVO = null)
        {
            return this._Features = ADO.DataADO.GetInstant().SelectBy<ams_Feature>("status", 1, buVO ?? new VOCriteria());
        }
        public List<ams_Config> LoadConfig(VOCriteria buVO = null)
        {
            return this._Configs = ADO.DataADO.GetInstant().SelectBy<ams_Config>("status", 1, buVO ?? new VOCriteria());
        }
        public List<ams_ObjectSize> LoadObjectSize(VOCriteria buVO = null)
        {
            this._ObjectSizes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_ObjectSize>("status", 1, buVO ?? new VOCriteria()));
            var subVals = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_ObjectSizeMap>("status", 1, buVO ?? new VOCriteria()));
            this._ObjectSizes.ForEach(x => x.ObjectSizeInners = subVals.FindAll(y => y.OuterObjectSize_ID == x.ID));
            return this._ObjectSizes;
        }
        public List<amv_PackUnitConvert> LoadPackUnitConvert(VOCriteria buVO = null)
        {
            return this._PackUnitConverts = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<amv_PackUnitConvert>(new SQLConditionCriteria[] { }, buVO ?? new VOCriteria()));
        }
        public List<ams_UnitType> LoadUnitType(VOCriteria buVO = null)
        {
            return this._UnitTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_UnitType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_AreaMaster> LoadAreaMaster(VOCriteria buVO = null)
        {
            return this._AreaMasters = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_AreaMaster>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_AreaRoute> LoadAreaRoute(VOCriteria buVO = null)
        {
            return this._AreaRoutes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_AreaRoute>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_AreaMasterType> LoadAreaMasterType(VOCriteria buVO = null)
        {
            return this._AreaMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_AreaMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Warehouse> LoadWarehouse(VOCriteria buVO = null)
        {
            return this._Warehouses = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Warehouse>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Branch> LoadBranch(VOCriteria buVO = null)
        {
            return this._Branchs = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Branch>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Customer> LoadCustomer(VOCriteria buVO = null)
        {
            return this._Customers = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Customer>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Supplier> LoadSupplier(VOCriteria buVO = null)
        {
            return this._Suppliers = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Supplier>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_PackMasterType> LoadPackMasterType(VOCriteria buVO = null)
        {
            return this._PackMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_PackMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_APIService> LoadAPIService(VOCriteria buVO = null)
        {
            return this._APIServices = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_APIService>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_SKUMasterType> LoadSKUMasterType(VOCriteria buVO = null)
        {
            return this._SKUMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_SKUMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_Transport> LoadTransport(VOCriteria buVO = null)
        {
            return this._Transports = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_Transport>("status", 1, buVO ?? new VOCriteria()));
        }
        public List<ams_PackMaster> LoadPackMasterEmptyPallets(VOCriteria buVO = null)
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
                this._PackMasterEmptyPallets = new List<ams_PackMaster>();
            }
            return this._PackMasterEmptyPallets;
        }
        public List<ams_SKUMaster> LoadSKUMasterEmptyPallets(VOCriteria buVO = null)
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
                this._SKUMasterEmptyPallets = new List<ams_SKUMaster>();
            }
            return this._SKUMasterEmptyPallets;
        }
        public List<ams_BaseMasterType> LoadBaseMasterType(VOCriteria buVO = null)
        {
            return this._BaseMasterTypes = Enumerable.ToList(ADO.DataADO.GetInstant().SelectBy<ams_BaseMasterType>("status", 1, buVO ?? new VOCriteria()));
        }
        public void ClearStaticByTableName(string tableName)
        {
            if (tableName.StartsWith("ams_"))
            {
                if (tableName == typeof(ams_Feature).Name) this._Features = null;
                else if (tableName == typeof(ams_Config).Name) this._Configs = null;
                else if (tableName == typeof(ams_ObjectSize).Name) this._ObjectSizes = null;
                else if (tableName == typeof(ams_UnitType).Name) this._UnitTypes = null;
                else if (tableName == typeof(ams_AreaMaster).Name) this._AreaMasters = null;
                else if (tableName == typeof(ams_AreaRoute).Name) this._AreaRoutes = null;
                else if (tableName == typeof(ams_AreaMasterType).Name) this._AreaMasterTypes = null;
                else if (tableName == typeof(ams_Warehouse).Name) this._Warehouses = null;
                else if (tableName == typeof(ams_Branch).Name) this._Branchs = null;
                else if (tableName == typeof(ams_Customer).Name) this._Customers = null;
                else if (tableName == typeof(ams_Supplier).Name) this._Suppliers = null;
                else if (tableName == typeof(ams_APIService).Name) this._APIServices = null;
                else if (tableName == typeof(ams_Transport).Name) this._Transports = null;
                else if (tableName == typeof(ams_PackMasterType).Name) this._PackMasterTypes = null;
                else if (tableName == typeof(ams_SKUMasterType).Name) this._SKUMasterTypes = null;
                else if (tableName == typeof(ams_BaseMasterType).Name) this._BaseMasterTypes = null;
                else if (tableName == typeof(ams_PackMaster).Name) { this._PackUnitConverts = null; this._PackMasterEmptyPallets = null; }
                else if (tableName == typeof(ams_SKUMaster).Name) { this._SKUMasterEmptyPallets = null; }
            }
        }

        //--------------GET Feature & Config
        public bool IsFeature(FeatureCode code)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            var feature = this._Features.FirstOrDefault(x => x.Code == c);
            return feature == null ? false : feature.DataValue == AWMSModel.Constant.StringConst.YesNoConst.YES;
        }
        public string GetFeatureValue(FeatureCode code)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            return GetFeatureValue(c);
        }
        public string GetFeatureValue(string code)
        {
            var feature = this._Features.FirstOrDefault(x => x.Code == code);
            return feature == null ? null : feature.DataValue;
        }
        public ams_Feature GetFeature(string code)
        {
            var feature = this._Features.FirstOrDefault(x => x.Code == code);
            return feature;
        }

        public string GetConfigValue(ConfigCode code)
        {
            return GetConfigValue(code.ToString());
        }
        public string GetConfigValue(string code)
        {
            string c = code;
            var config = this._Configs.FirstOrDefault(x => x.Code == c);
            return config == null ? null : config.DataValue;
        }

        public bool IsMatchConfigArray(string code, object value)
        {
            string v = value.ToString();
            return Regex.IsMatch(this.GetConfigValue(code), string.Format("^{0}$|^{0},|,{0},|,{0}$", v));
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

        //---------------PACK Convert UNIT
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


    }
}
