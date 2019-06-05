using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public interface IStaticValueManager
    {
        Dictionary<string, ams_Feature> Features { get; }
        Dictionary<string, ams_Config> Configs { get; }
        List<ams_ObjectSize> ObjectSizes { get; }
        List<ams_Branch> Branchs { get; }
        ams_Branch GetBranch(long? branchID, long? warehouseID, long? areaID, string branchCode, string warehouseCode, string areaCode);
        List<ams_Warehouse> Warehouses { get; }
        ams_Warehouse GetWarehouse(long? warehouseID, long? areaID, string warehouseCode, string areaCode);
        List<ams_AreaMaster> AreaMasters { get; }
        ams_AreaMaster GetAreaMaster(long? areaID, string areaCode);
        List<ams_AreaMasterType> AreaMasterTypes { get; }
        List<ams_AreaRoute> AreaMasterLines { get; }
        List<ams_Supplier> Suppliers { get; }
        List<ams_Customer> Customers { get; }
        List<ams_PackMasterType> PackMasterTypes { get; }
        List<ams_SKUMasterType> SKUMasterTypes { get; }
        List<ams_APIService> APIServices { get; }
        List<ams_Transport> Transports { get; }
        List<ams_UnitType> UnitTypes { get; }
        List<amv_PackUnitConvert> PackUnitConverts { get; }

        ConvertUnitCriteria ConvertToNewUnitBySKU(long skuID, decimal qty, long oldUnitTypeID, long newUnitTypeID);
        ConvertUnitCriteria ConvertToBaseUnitBySKU(long skuID, decimal qty, long oldUnitTypeID);
        ConvertUnitCriteria ConvertToBaseUnitBySKU(string skuCode, decimal qty, long oldUnitTypeID);
        ConvertUnitCriteria ConvertToBaseUnitByPack(string packCode, decimal qty, long oldUnitTypeID);
        ConvertUnitCriteria ConvertToBaseUnitByPack(long packID, decimal qty, long oldUnitTypeID);
        ConvertUnitCriteria ConvertToNewUnitBySKU(string skuCode, decimal qty, long oldUnitTypeID, long newUnitTypeID);
        ConvertUnitCriteria ConvertToNewUnitByPack(string packCode, decimal qty, long oldUnitTypeID, long newUnitTypeID);
        ConvertUnitCriteria ConvertToNewUnitByPack(long packID, decimal qty, long oldUnitTypeID, long newUnitTypeID);
        void LoadAll();
        void LoadFeature(VOCriteria buVO = null);
        void LoadConfig(VOCriteria buVO = null);
        void LoadObjectSize(VOCriteria buVO = null);
        void LoadPackMaster(VOCriteria buVO = null);
        void LoadUnitType(VOCriteria buVO = null);
        void LoadAreaMaster(VOCriteria buVO = null);
        void LoadAreaRoute(VOCriteria buVO = null);
        void LoadAreaMasterType(VOCriteria buVO = null);
        void LoadWarehouse(VOCriteria buVO = null);
        void LoadBranch(VOCriteria buVO = null);
        void LoadCustomer(VOCriteria buVO = null);
        void LoadSupplier(VOCriteria buVO = null);
        void LoadPackMasterType(VOCriteria buVO = null);
        void LoadAPIService(VOCriteria buVO = null);
        void LoadSKUMasterType(VOCriteria buVO = null);
        void LoadTransport(VOCriteria buVO = null);
        bool IsFeature(FeatureCode code);
        string GetFeatureValue(FeatureCode code);
        string GetConfig(ConfigCode code);
        string GetConfig(string code);
        T GetEntity<T>(long? id, string code)where T : BaseEntitySTD;
        bool IsMatchConfigArray(string code, object value);
        EntityStatus? GetStatusInConfigByEventStatus<T>(T? value) where T : struct, IComparable, IFormattable, IConvertible;
    }
}
