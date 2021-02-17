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
        public static TreeNode<int> GetLocationRouteTree(string souLocCode, string desLocCode)
        {
            int souLocID = (int)StaticValueManager.GetInstant().Locations.First(x => x.Code == souLocCode).ID.Value;
            int desLocID = (int)StaticValueManager.GetInstant().Locations.First(x => x.Code == souLocCode).ID.Value;
            return GetLocationRouteTree(souLocID, desLocID);
        }
        public static TreeNode<int> GetLocationRouteTree(int souLocID, int desLocID)
        {
            var res = GetLocationRouteTree(souLocID, desLocID, new List<acs_LocationRoute>());
            return res;
        }
        private static TreeNode<int> GetLocationRouteTree(int souLocID, int desLocID, List<acs_LocationRoute> useLocRoutes)
        {
            var locs = StaticValueManager.GetInstant().LocationRoutes.FindAll(x => x.Sou_Location_ID == souLocID && !useLocRoutes.Contains(x));
            useLocRoutes.AddRange(locs);
            //useLocRoutes.RemoveAll(x=>locs.Contains(x));
            foreach (var loc in locs)
            {
                if (loc == null) return null;

                if (loc.Des_Location_ID == desLocID)
                {
                    TreeNode<int> child = new TreeNode<int>(desLocID);
                    TreeNode<int> tree = new TreeNode<int>(souLocID);
                    tree.Add(child);
                    return tree;
                }
                else
                {
                    TreeNode<int> child = GetLocationRouteTree(loc.Des_Location_ID, desLocID, useLocRoutes);
                    if (child != null)
                    {
                        TreeNode<int> tree = new TreeNode<int>(souLocID);
                        tree.Add(child);
                        return tree;
                    }
                }
            }
            return null;
        }
    }
}
