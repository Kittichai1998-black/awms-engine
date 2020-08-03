using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AWMSEngine.ADO.StaticValue
{
    public partial class StaticValueManager
    {
        public AreaMasterGroupType GetAreaMasterGroupType(long areaID)
        {
            var area = AreaMasters.Find(x => x.ID == areaID);
            return GetAreaMasterGroupType(area.AreaMasterType_ID);
        }
        public AreaMasterGroupType GetAreaMasterGroupType(AreaMasterTypeID areaTypeID)
        {
            var areaType = AreaMasterTypes.Find(x => x.ID == (long)areaTypeID);
            return areaType.groupType;
        }
        public ams_AreaMaster GetAreaMaster(long areaID)
        {
            return this.GetAreaMaster(areaID, null);
        }
        public ams_AreaMaster GetAreaMaster(string areaCode)
        {
            return this.GetAreaMaster(null, areaCode);
        }
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
            return this.AreaMasters.First(x => x.ID == id).Code;
        }

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
            return this.Warehouses.First(x => x.ID == id).Code;
        }

        //FEATURE
        /*public T GetFeaturValue<T>(FeatureCode code, DocumentProcessTypeID? processType = null, DocumentTypeID? docType = null)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            return GetFeaturValue<T>(c, processType, docType);
        }
        public T GetFeaturValue<T>(string code, DocumentProcessTypeID? processType = null, DocumentTypeID? docType = null)
        {
            string c = code;
            var feature = this.Features.Where(x => x.Code == c)
                .OrderBy(x => x.DocumentProcessType_ID.HasValue ? 0 : 1)
                .ThenBy(x => x.DocumentType_ID.HasValue ? 0 : 1)
                .Where(x => x.DocumentProcessType_ID == processType || !x.DocumentProcessType_ID.HasValue)
                .FirstOrDefault(x => x.DocumentType_ID == docType || !x.DocumentType_ID.HasValue);
            if (feature == null)
                throw new Exception("ไม่พบ Feature Code '" + c + "' ในระบบ!");

            return feature.DataValue.Get<T>();
        }*/

        public string GetConfigValue(ConfigFlow code, DocumentProcessTypeID processType)
        {
            string c = string.Format(code.Attribute<EnumValueAttribute>().ValueString, (int)processType);
            return GetConfigValue<string>(c);
        }
        public string GetConfigValue(ConfigCommon code)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            return GetConfigValue<string>(c);
        }
        public string GetConfigValue(string code)
        {
            return GetConfigValue<string>(code);
        }
        public T GetConfigValue<T>(ConfigCommon code)
        {
            string c = code.Attribute<EnumValueAttribute>().ValueString;
            return GetConfigValue<T>(c);
        }
        public T GetConfigValue<T>(string code)
        {
            string _namespace = code.LastIndexOf('.') > 0 ? code.Substring(0, code.LastIndexOf('.')) : string.Empty;
            string _datakey = code.LastIndexOf('.') > 0 ? code.Substring(code.LastIndexOf('.')+1) : code;

            var config = this.Configs.FirstOrDefault(x => x.DataKey == _datakey && (x.Namespace ?? string.Empty) == _namespace);
            if (config == null)
                throw new Exception("ไม่พบ Config '" + code + "' ในระบบ!");
            return config.DataValue.Get<T>();
        }
        public bool IsMatchConfigArray(string code, object value)
        {
            string v = value.ToString();
            return Regex.IsMatch(this.GetConfigValue(code), string.Format("^{0}$|^{0},|,{0},|,{0}$", v));
        }
    }
}
