﻿using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class aml_StorageObjectEvent :IEntityModel
    {
        public long? ID;
        public string LogRefID;
        public string WMSRefID;
        public string ActionCommand;
        public long? Document_ID;
        public long? DocumentItem_ID;
        public long? DocumentItem_Code;
        public long? Sou_RootStorageObject_ID;
        public string Sou_RootStorageObject_Code;
        public long? Sou_ParentStorageObject_ID;
        public string Sou_ParentStorageObject_Code;
        public long? Sou_StorageObject_ID;
        public string Sou_StorageObject_Code;
        public string Sou_StorageObject_ObjectType;
        public string Sou_StorageObject_Name;
        public string Sou_StorageObject_EventStatus;
        public string Sou_StorageObject_Status;
        public string Sou_SKUMaster_ID;
        public string Sou_SKUMaster_Code;
        public string Sou_SKUMaster_Name;
        public string Sou_PackMaster_ID;
        public string Sou_PackMaster_Code;
        public string Sou_PackMaster_Name;
        public string Sou_PackMaster_ItemQty;
        public string Sou_BaseMaster_ID;
        public string Sou_BaseMaster_Code;
        public string Sou_BaseMaster_Name;
        public string Sou_Branch_ID;
        public string Sou_Branch_Code;
        public string Sou_Warehouse_ID;
        public string Sou_Warehouse_Code;
        public string Sou_AreaMaster_ID;
        public string Sou_AreaMaster_Code;
        public string Sou_AreaLocationMaster_ID;
        public string Sou_AreaLocationMaster_Bank;
        public string Sou_AreaLocationMaster_Bay;
        public string Sou_AreaLocationMaster_LV;
        public string Des_StorageObject_ID;
        public string Des_RootStorageObject_ID;
        public string Des_ParentStorageObject_ID;
        public string Des_StorageObject_ObjectType;
        public string Des_StorageObject_Code;
        public string Des_StorageObject_Name;
        public string Des_StorageObject_EventStatus;
        public string Des_StorageObject_Status;
        public string Des_SKUMaster_ID;
        public string Des_SKUMaster_Code;
        public string Des_SKUMaster_Name;
        public string Des_PackMaster_ID;
        public string Des_PackMaster_Code;
        public string Des_PackMaster_Name;
        public string Des_PackMaster_ItemQty;
        public string Des_BaseMaster_ID;
        public string Des_BaseMaster_Code;
        public string Des_BaseMaster_Name;
        public string Des_Branch_ID;
        public string Des_Branch_Code;
        public string Des_Warehouse_ID;
        public string Des_Warehouse_Code;
        public string Des_AreaMaster_ID;
        public string Des_AreaMaster_Code;
        public string Des_AreaLocationMaster_ID;
        public string Des_AreaLocationMaster_Bank;
        public string Des_AreaLocationMaster_Bay;
        public string Des_AreaLocationMaster_LV;
        public string ResultStatus;
        public string ResultCode;
        public string ResultMessage;
        public string TechMessage;
        public string ActionBy;
        public string StartTime;
        public string EndTime;
    }
}