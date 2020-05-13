using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Criteria;
using System.Text.RegularExpressions;
using AMWUtil.Exception;

namespace AWMSEngine.ADO.StaticValue
{
    public partial class StaticValueManager : IStaticValueManager
    {
        private List<ams_Feature> _Features;
        public List<ams_Feature> Features { get => this._Features ?? this.LoadFeature(); }

        private List<ams_Config> _Configs;
        public List<ams_Config> Configs { get => this._Configs ?? this.LoadConfig(); }

        private List<ams_ObjectSize> _ObjectSizes;
        public List<ams_ObjectSize> ObjectSizes { get => this._ObjectSizes ?? this.LoadObjectSize(); }

        private List<ams_Branch> _Branchs;
        public List<ams_Branch> Branchs { get => this._Branchs ?? this.LoadBranch(); }

        private List<ams_Warehouse> _Warehouses;
        public List<ams_Warehouse> Warehouses { get => this._Warehouses ?? this.LoadWarehouse(); }

        private List<ams_AreaMaster> _AreaMasters;
        public List<ams_AreaMaster> AreaMasters { get => this._AreaMasters ?? this.LoadAreaMaster(); }

        private List<ams_AreaMasterType> _AreaMasterTypes;
        public List<ams_AreaMasterType> AreaMasterTypes { get => this._AreaMasterTypes ?? this.LoadAreaMasterType(); }

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

        private List<ams_WorkerService> _WorkerService;
        public List<ams_WorkerService> WorkerService { get => this._WorkerService ?? this.LoadWorkerService(); }

        private List<ams_ScheduleService> _ScheduleService;
        public List<ams_ScheduleService> ScheduleService { get => this._ScheduleService ?? this.LoadScheduleService(); }

        private List<ams_HubService> _HubService;
        public List<ams_HubService> HubService { get => this._HubService ?? this.LoadHubService(); }

        private List<ams_WaveSeqTemplate> _WaveSeqTemplates;
        public List<ams_WaveSeqTemplate> WaveSeqTemplates { get => this._WaveSeqTemplates ?? this.LoadWaveSeqTemplates(); }

        private List<ams_PrintForm> _PrintForm;
        public List<ams_PrintForm> PrintForm { get => this._PrintForm ?? this.LoadPrintForm(); }

        private List<ams_PrintLayout> _PrintLayout;
        public List<ams_PrintLayout> PrintLayout { get => this._PrintLayout ?? this.LoadPrintLayout(); }

        private List<ams_PrintField> _PrintField;
        public List<ams_PrintField> PrintField { get => this._PrintField ?? this.LoadPrintField(); }

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
            if (tableName.StartsWith("ams_"))
            {
                if (tableName == typeof(ams_Feature).Name) this._Features = null;
                else if (tableName == typeof(ams_Config).Name) this._Configs = null;
                else if (tableName == typeof(ams_ObjectSize).Name || tableName == typeof(ams_ObjectSizeMap).Name) this._ObjectSizes = null;
                else if (tableName == typeof(ams_UnitType).Name) this._UnitTypes = null;
                else if (tableName == typeof(ams_AreaMaster).Name) this._AreaMasters = null;
                else if (tableName == typeof(ams_AreaRoute).Name) this._AreaRoutes = null;
                /*else if (tableName == typeof(ams_AreaMasterType).Name) this._AreaMasterTypes = null;*/
                else if (tableName == typeof(ams_Warehouse).Name) this._Warehouses = null;
                else if (tableName == typeof(ams_Branch).Name) this._Branchs = null;
                else if (tableName == typeof(ams_Customer).Name) this._Customers = null;
                else if (tableName == typeof(ams_Supplier).Name) this._Suppliers = null;
                else if (tableName == typeof(ams_APIService).Name) this._APIServices = null;
                else if (tableName == typeof(ams_Transport).Name) this._Transports = null;
                else if (tableName == typeof(ams_PackMasterType).Name) this._PackMasterTypes = null;
                else if (tableName == typeof(ams_SKUMasterType).Name) this._SKUMasterTypes = null;
                else if (tableName == typeof(ams_BaseMasterType).Name) this._BaseMasterTypes = null;
                else if (tableName == typeof(ams_PackMaster).Name)
                {
                    this._PackUnitConverts = null;
                    this._PackMasterEmptyPallets = null;
                }
                else if (tableName == typeof(ams_SKUMaster).Name)
                {
                    this._SKUMasterEmptyPallets = null;
                    this._PackUnitConverts = null;
                    this._PackMasterEmptyPallets = null;
                }
                else if (tableName == typeof(ams_ScheduleService).Name) this._ScheduleService = null;
                else if (tableName == typeof(ams_WorkerService).Name) this._WorkerService = null;
                else if (tableName == typeof(ams_HubService).Name) this._HubService = null;
            }
        }

        //--------------GET Feature & Config
        public bool IsFeature(FeatureCode code)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            var feature = this.Features.FirstOrDefault(x => x.Code == c);
            return feature == null ? false : feature.DataValue == AWMSModel.Constant.StringConst.YesNoConst.YES;
        }
        public bool IsFeature(string code)
        {
            string c = code;
            var feature = this.Features.FirstOrDefault(x => x.Code == c);
            return feature == null ? false : feature.DataValue == AWMSModel.Constant.StringConst.YesNoConst.YES;
        }
        public string GetFeatureValue(FeatureCode code)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            return GetFeatureValue(c);
        }
        public string GetFeatureValue(string code)
        {
            var feature = this.Features.FirstOrDefault(x => x.Code == code);
            return feature == null ? null : feature.DataValue;
        }
        public ams_Feature GetFeature(string code)
        {
            var feature = this.Features.FirstOrDefault(x => x.Code == code);
            return feature;
        }

        public string GetConfigValue(ConfigCode code)
        {
            return GetConfigValue(code.ToString());
        }
        public string GetConfigValue(string code)
        {
            string c = code;
            var config = this.Configs.FirstOrDefault(x => x.Code == c);
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
                                (value is WorkQueueEventStatus) ? "Q" :
                                (value is WaveEventStatus) ? "WAVE" : string.Empty;
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
        public ConvertUnitCriteria ConvertToBaseUnitBySKU(long skuID, decimal oldQty, long oldUnitTypeID)
        {
            var baseUnitID = this.PackUnitConverts.First(x => x.SKUMaster_ID == skuID).BaseUnitType_ID;
            var convertUnit = this.ConvertToNewUnitBySKU(skuID, oldQty, oldUnitTypeID, baseUnitID);
            return convertUnit;
        }
        public ConvertUnitCriteria ConvertToBaseUnitBySKU(string skuCode, decimal oldQty, long oldUnitTypeID)
        {
            int skuID = this.PackUnitConverts.First(x => x.SKUMaster_Code == skuCode).SKUMaster_ID;
            return this.ConvertToBaseUnitBySKU(skuID, oldQty, oldUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToBaseUnitByPack(string packCode, decimal oldQty, long oldUnitTypeID)
        {
            int skuID = this.PackUnitConverts.First(x => x.PackMaster_Code == packCode).SKUMaster_ID;
            return this.ConvertToBaseUnitBySKU(skuID, oldQty, oldUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToBaseUnitByPack(long packID, decimal oldQty, long oldUnitTypeID)
        {
            int skuID = this.PackUnitConverts.First(x => x.PackMaster_ID == packID).SKUMaster_ID;
            return this.ConvertToBaseUnitBySKU(skuID, oldQty, oldUnitTypeID);
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


        public ConvertUnitCriteria ConvertToNewUnitBySKU(long skuID, decimal oldQty, long oldUnitTypeID, long newUnitTypeID)
        {
            var unitPackH = this.PackUnitConverts.FindAll(x => x.SKUMaster_ID == skuID).FirstOrDefault();
            var unitPack = this.PackUnitConverts.FindAll(x => x.SKUMaster_ID == skuID);
           

            if (unitPackH == null)
                throw new Exception("Fail : UnitType ไม่มีใน Pack Convert");

            var arr = new dataConvert();
            arr.covertLists = new List<dataConvert.convertList>();
            unitPack.ForEach(x =>
            {
                arr.covertLists.Add(new dataConvert.convertList()
                {
                    unitType_C1 = x.C1_UnitType_ID,
                    qty_C1 = x.C1_Quantity,
                    unitType_C2 = x.C2_UnitType_ID,
                    qty_C2 = x.C2_Quantity
                });

                arr.covertLists.Add(new dataConvert.convertList()
                {
                    unitType_C1 = x.C2_UnitType_ID,
                    qty_C1 = x.C2_Quantity,
                    unitType_C2 = x.C1_UnitType_ID,
                    qty_C2 = x.C1_Quantity
                });

            });

            var checkUnit = arr.covertLists.FindAll(x => x.unitType_C1 == oldUnitTypeID);
            if (checkUnit.Count == 0)
                throw new Exception("Covert Unit Fail : UnitType ไม่มีใน Config Convert");


            var dataConvert_C2 = CovertUnit(oldQty, oldUnitTypeID, newUnitTypeID,arr.covertLists);
            var dataConvert_BaseQty = CovertUnit(oldQty, oldUnitTypeID, unitPackH.UnitType_ID, arr.covertLists);

            if (checkUnit == null)
                throw new Exception("Covert Unit Fail : UnitType ไม่มีlามารถ Convert ได้");


            return new ConvertUnitCriteria()
            {
                skuMaster_ID = unitPackH.SKUMaster_ID,
                skuMaster_Code = unitPackH.SKUMaster_Code,
                packMaster_ID = unitPackH.PackMaster_ID,
                packMaster_Code = unitPackH.PackMaster_Code,
                newQty = dataConvert_C2 == null ? 0 : dataConvert_C2.Value,
                newUnitType_ID = newUnitTypeID,
                oldQty = oldQty,
                oldUnitType_ID = oldUnitTypeID,
                baseQty = dataConvert_BaseQty.Value,
                baseUnitType_ID = unitPackH.UnitType_ID,
                C2_Quantity = dataConvert_C2 == null ? 0 : dataConvert_C2.Value,
                C2_UnitType_ID = newUnitTypeID,
                C1_Quantity = oldQty,
                C1_UnitType_ID = oldUnitTypeID,
             
            };

        }

        private static decimal? CovertUnit(decimal c1qty, long c1unit, long c2unit,List< dataConvert.convertList> arr)
        {

            var cm = arr.FirstOrDefault(x => x.unitType_C1 == c1unit && x.unitType_C2 == c2unit);
            if (cm != null)
            {
                return (c1qty / cm.qty_C1) * cm.qty_C2;
            }

            foreach (var cm2 in arr.FindAll(x => x.unitType_C1 == c1unit))
            {
                var _c1qty = (c1qty / cm2.qty_C1) * cm2.qty_C2;
                var _c1unit = cm2.unitType_C2;
                var _res = CovertUnit(_c1qty, _c1unit, c2unit, arr.FindAll(x => !x.Equals(cm2)));
                if (_res.HasValue)
                {
                    return _res;
                }
            }

            return null;

        }

        public ConvertUnitCriteria ConvertToNewUnitBySKU(string skuCode, decimal oldQty, long oldUnitTypeID, long newUnitTypeID)
        {
            var skuID = this.PackUnitConverts.First(x => x.SKUMaster_Code == skuCode).SKUMaster_ID;
            return this.ConvertToNewUnitBySKU(skuID, oldQty, oldUnitTypeID, newUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToNewUnitByPack(string packCode, decimal oldQty, long oldUnitTypeID, long newUnitTypeID)
        {
            int skuID = this.PackUnitConverts.First(x => x.PackMaster_Code == packCode).SKUMaster_ID;
            return this.ConvertToNewUnitBySKU(skuID, oldQty, oldUnitTypeID, newUnitTypeID);
        }
        public ConvertUnitCriteria ConvertToNewUnitByPack(long packID, decimal oldQty, long oldUnitTypeID, long newUnitTypeID)
        {
            int skuID = this.PackUnitConverts.First(x => x.PackMaster_ID == packID).SKUMaster_ID;
            return this.ConvertToNewUnitBySKU(skuID, oldQty, oldUnitTypeID, newUnitTypeID);
        }

        public List<ConvertUnitCriteria> ConvertToALlUnitBySKU(long skuID, decimal oldQty, long oldUnitTypeID)
        {
            var packConverts = this.PackUnitConverts.FindAll(x => x.SKUMaster_ID == skuID);
            var res = packConverts.Select(x => ConvertToNewUnitBySKU(skuID, oldQty, oldUnitTypeID, x.UnitType_ID)).ToList();
            return res;
        }

    }
}
