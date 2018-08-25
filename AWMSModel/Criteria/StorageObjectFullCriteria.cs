using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;
using AWMSModel.Entity;

namespace AWMSModel.Criteria
{
    public class StorageObjectFullCriteria : SPOutSTOSearchCriteria
    {
        public List<StorageObjectFullCriteria> StorageObjectChilds;

        public static List<StorageObjectFullCriteria> Generate(List<StorageObjectFullCriteria> stos, long? parentID = null)
        {
            List<StorageObjectFullCriteria> stoRoots = stos
                                                        .Where(x => x.ParentStorageObject_ID == parentID)
                                                        .ToList();
            
            stoRoots.ForEach(x =>
            {
                x.ChildPackMaster_Codes = new List<string>();
                x.ChildPackMaster_Names = new List<string>();
                x.ChildSKUMaster_Codes = new List<string>();
                x.ChildSKUMaster_Names = new List<string>();
                if (!string.IsNullOrWhiteSpace(x.PackMaster_Code))
                    x.ChildPackMaster_Codes.Add(x.PackMaster_Code);
                if (!string.IsNullOrWhiteSpace(x.PackMaster_Name))
                    x.ChildPackMaster_Names.Add(x.PackMaster_Name);
                if (!string.IsNullOrWhiteSpace(x.SKUMaster_Code))
                    x.ChildSKUMaster_Codes.Add(x.SKUMaster_Code);
                if (!string.IsNullOrWhiteSpace(x.SKUMaster_Name))
                    x.ChildSKUMaster_Names.Add(x.SKUMaster_Name);

                x.StorageObjectChilds = Generate(stos, x.ID);

                x.ViewChildPackMaster_Qty = x.StorageObjectChilds.Sum(y => y.ObjectType == StorageObjectType.PACK ? 1 : 0);
                x.ViewChildSKUMaster_Qty = x.StorageObjectChilds.Sum(y => y.ObjectType == StorageObjectType.PACK ? y.PackMaster_ItemQty.Value : 0);
                x.StorageObjectChilds.ForEach(y => {
                    x.ChildPackMaster_Codes = x.ChildPackMaster_Codes.Union(y.ChildPackMaster_Codes).ToList();
                    x.ChildPackMaster_Names = x.ChildPackMaster_Names.Union(y.ChildPackMaster_Names).ToList();
                    x.ChildSKUMaster_Codes = x.ChildSKUMaster_Codes.Union(y.ChildSKUMaster_Codes).ToList();
                    x.ChildSKUMaster_Names = x.ChildSKUMaster_Names.Union(y.ChildSKUMaster_Names).ToList();
                    x.ViewChildPackMaster_Qty += y.ViewChildPackMaster_Qty;
                    x.ViewChildSKUMaster_Qty += y.ViewChildSKUMaster_Qty;
                });

                x.ViewChildPackMaster_Codes = string.Join(", ", x.ChildPackMaster_Codes);
                x.ViewChildPackMaster_Names = string.Join(", ", x.ChildPackMaster_Names);
                x.ViewChildSKUMaster_Codes = string.Join(", ", x.ChildSKUMaster_Codes);
                x.ViewChildSKUMaster_Names = string.Join(", ", x.ChildSKUMaster_Names);

                x.ViewPackMaster_Qty = x.ViewChildPackMaster_Qty + (x.ObjectType == StorageObjectType.PACK ? 1 : 0);
                x.ViewSKUMaster_Qty = x.ViewChildSKUMaster_Qty + (x.PackMaster_ItemQty ?? 0);
            });

            return stoRoots;
        }

    }
}
