using AMWUtil.Exception;
using ADO.WMSStaticValue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public static class StaticValidation
    {
        public static bool Branch_VerifyCode(string code)
        {
            return StaticValueManager.GetInstant().Branchs.Any(x => x.Code == code);
        }
        public static bool Warehouse_VerifyCode(string code)
        {
            return StaticValueManager.GetInstant().Warehouses.Any(x => x.Code == code);
        }
        public static bool AreaMaster_VerifyCode(string code)
        {
            return StaticValueManager.GetInstant().AreaMasters.Any(x => x.Code == code);
        }
        public static bool AreaMasterType_VerifyCode(string code)
        {
            return StaticValueManager.GetInstant().AreaMasterTypes.Any(x => x.Code == code);
        }
        public static bool Customer_VerifyCode(string code)
        {
            return StaticValueManager.GetInstant().Customers.Any(x => x.Code == code);
        }
        public static bool Supplier_VerifyCode(string code)
        {
            return StaticValueManager.GetInstant().Suppliers.Any(x => x.Code == code);
        }
    }
}
