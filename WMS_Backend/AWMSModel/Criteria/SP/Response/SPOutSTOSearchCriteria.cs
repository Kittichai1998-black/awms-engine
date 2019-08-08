using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutSTOSearchCriteria
    {
        public long ID;
        public string Code;
        public long? ParentStorageObject_ID;
        public StorageObjectType ObjectType;
        public string Batch;
        public string Lot;
        public DateTime? ExpiryDate;
        public DateTime? ProductDate;
        public decimal? WeigthKG;
        public decimal? WidthM;
        public decimal? LengthM;
        public decimal? HeightM;
        public int? HoleStatus;
        public int? Status;
        public int CreateBy;
        public DateTime CreateTime;
        public int? ModifyBy;
        public DateTime? ModifyTime;

        public long? Branch_ID;
        public string Branch_Code;
        public string Branch_Name;

        public long? Warehouse_ID;
        public string Warehouse_Code;
        public string Warehouse_Name;

        public long? AreaMaster_ID;
        public string AreaMaster_Code;
        public string AreaMaster_Name;

        public long? AreaLocationMaster_ID;
        public string AreaLocationMaster_Code;
        public string AreaLocationMaster_Gate;
        public string AreaLocationMaster_Bank;
        public string AreaLocationMaster_Bay;
        public string AreaLocationMaster_Level;

        public long? BaseMaster_ID;
        public string BaseMaster_Code;
        public string BaseMaster_Name;

        public long? PackMaster_ID;
        public string PackMaster_Code;
        public string PackMaster_Name;
        public decimal? PackMaster_WeightKG;
        public decimal? PackMaster_WidthM;
        public decimal? PackMaster_LengthM;
        public decimal? PackMaster_HeightM;
        public int? PackMaster_ItemQty;

        public long? SKUMaster_ID;
        public string SKUMaster_Code;
        public string SKUMaster_Name;

        public long? Customer_ID;
        public string Customer_Code;
        public string Customer_Name;


        public List<string> ChildSKUMaster_Codes;
        public List<string> ChildSKUMaster_Names;
        public List<string> ChildPackMaster_Codes;
        public List<string> ChildPackMaster_Names;

        public string ViewChildSKUMaster_Codes;
        public string ViewChildSKUMaster_Names;
        public int ViewChildSKUMaster_Qty;

        public string ViewChildPackMaster_Codes;
        public string ViewChildPackMaster_Names;
        public int ViewChildPackMaster_Qty;
        
        public int ViewSKUMaster_Qty;        
        public int ViewPackMaster_Qty;

        public StorageObjectEventStatus EventStatus;
    }
}
