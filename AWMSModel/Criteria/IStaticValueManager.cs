using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public interface IStaticValueManager
    {
        List<amv_Feature> Features { get; }
        List<ams_Config> Configs { get; }
        List<ams_ObjectSize> ObjectSizes { get; }
        List<ams_Branch> Branchs { get; }
        List<ams_Warehouse> Warehouses { get; }
        List<ams_AreaMaster> AreaMasters { get; }
        /*List<ams_AreaMasterType> AreaMasterTypes { get; }*/
        List<ams_AreaRoute> AreaRoutes { get; }
        List<ams_Supplier> Suppliers { get; }
        List<ams_Customer> Customers { get; }
        List<ams_PackMasterType> PackMasterTypes { get; }
        List<ams_SKUMasterType> SKUMasterTypes { get; }
        List<ams_APIService> APIServices { get; }
        List<ams_TransportCar> TransportCars { get; }
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

    }
}
