using ADO.WCSStaticValue;
using AMSModel.Entity;
using AMWUtil.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Common
{
    public static class LocationUtil
    {
        public static TreeNode<long> GetLocationRouteTree(string souLocCode, string desLocCode)
        {
            var souLoc = StaticValueManager.GetInstant().Locations.First(x => x.Code == souLocCode);
            var desLoc = StaticValueManager.GetInstant().Locations.First(x => x.Code == desLocCode);
            var res = GetLocationRouteTree(souLoc.ID.Value, desLoc.ID.Value, new List<acs_LocationRoute>());
            return res;
        }
        public static TreeNode<long> GetLocationRouteTree(long souLocID, long desLocID)
        {
            var res = GetLocationRouteTree(souLocID, desLocID, new List<acs_LocationRoute>());
            return res;
        }
        private static TreeNode<long> GetLocationRouteTree(long souLocID, long desLocID, List<acs_LocationRoute> useLocRoutes)
        {
            var souLoc = StaticValueManager.GetInstant().Locations.First(x => x.ID == souLocID);
            var desLoc = StaticValueManager.GetInstant().Locations.First(x => x.ID == desLocID);

            var locs = StaticValueManager.GetInstant().LocationRoutes
                .FindAll(x => x.Sou_Area_ID == souLoc.Area_ID && (!x.Sou_Location_ID.HasValue || x.Sou_Location_ID == souLoc.ID) && !useLocRoutes.Contains(x));
            useLocRoutes.AddRange(locs);
            //useLocRoutes.RemoveAll(x=>locs.Contains(x));
            TreeNode<long> tree = null;
            foreach (var loc in locs)
            {
                if (loc == null) return null;

                if (loc.Des_Area_ID==desLoc.Area_ID && (!loc.Des_Location_ID.HasValue || loc.Des_Location_ID == desLocID))
                {
                    TreeNode<long> child = new TreeNode<long>(desLocID);
                    if (tree == null)
                        tree = new TreeNode<long>(souLocID);
                    tree.Add(child);
                }
                else
                {
                    StaticValueManager
                        .GetInstant()
                        .Locations
                        .FindAll(x => x.Area_ID == loc.Des_Area_ID && (loc.Des_Location_ID.HasValue || x.ID == loc.Des_Location_ID))
                        .ForEach(newSouLoc =>
                        {
                            TreeNode<long> child = GetLocationRouteTree(newSouLoc.ID.Value, desLocID, useLocRoutes);
                            if (child != null)
                            {
                                if (tree == null)
                                    tree = new TreeNode<long>(souLocID);
                                tree.Add(child);
                            }
                        });

                }
            }
            return tree;
        }
    }
}
