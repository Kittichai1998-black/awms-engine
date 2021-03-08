using ADO.WCSStaticValue;
using AMSModel.Entity;
using AMWUtil.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Util
{
    public static class LocationUtil
    {
        public static TreeNode<long> GetLocationRouteTree
            (string souLocCode, string desAreaCode, List<string> desLocCodes)
        {
            long souLocID = StaticValueManager.GetInstant().GetLocation(souLocCode).ID.Value;
            long? desAreaID = string.IsNullOrEmpty(desAreaCode) ? null : StaticValueManager.GetInstant().GetArea(desAreaCode).ID;
            List<long> desLocIDs = desLocCodes == null ? null : StaticValueManager.GetInstant().GetLocations(desLocCodes).Select(x => x.ID.Value).ToList();
            return GetLocationRouteTree(souLocID, desAreaID, desLocIDs);
        }
        public static TreeNode<long> GetLocationRouteTree
            (string souLocCode, string desAreaCode, string desLocCode)
        {
            long souLocID = StaticValueManager.GetInstant().GetLocation(souLocCode).ID.Value;
            long? desAreaID = string.IsNullOrEmpty(desAreaCode) ? null : StaticValueManager.GetInstant().GetArea(desAreaCode).ID;
            long? desLocID = string.IsNullOrEmpty( desLocCode) ? null : StaticValueManager.GetInstant().GetLocation(desLocCode).ID;
            return GetLocationRouteTree(souLocID, desAreaID, desLocID);
        }
        public static TreeNode<long> GetLocationRouteTree
            (long souLocID, long? desAreaID, long? desLocID)
        {
            return GetLocationRouteTree(souLocID, desAreaID, !desLocID.HasValue ? null : new List<long> { desLocID.Value });
        }
        public static TreeNode<long> GetLocationRouteTree
            (long souLocID, long? desAreaID, List<long> desLocIDs)
        {
            List<acs_Location> _desLocs = null;
            if (desLocIDs != null && desLocIDs.Count > 0)
                _desLocs = StaticValueManager.GetInstant()
                    .Locations.FindAll(x => desLocIDs.Contains(x.ID.Value)).ToList();
            else if (desAreaID.HasValue)
                _desLocs = StaticValueManager.GetInstant()
                    .Locations.FindAll(x => x.Area_ID == desAreaID).ToList();

            var souLoc = StaticValueManager.GetInstant().Locations.First(x => x.ID == souLocID);

            var res = GetLocationRouteTree(souLoc, _desLocs, new List<acs_LocationRoute>());
            return res;
        }
        private static TreeNode<long> GetLocationRouteTree(acs_Location souLoc, List<acs_Location> desLocs, List<acs_LocationRoute> useLocRoutes)
        {

            var rouLocs = StaticValueManager.GetInstant().LocationRoutes
                .FindAll(x => 
                        x.Sou_Area_ID == souLoc.Area_ID 
                        && (x.Sou_Location_ID??souLoc.ID.Value) == souLoc.ID.Value
                        && !useLocRoutes.Contains(x));

            useLocRoutes.AddRange(rouLocs);


            TreeNode<long> tree = null;
            foreach (var rouLoc in rouLocs)
            {
                foreach(var desLoc in desLocs)
                {
                    if (rouLoc.Des_Area_ID == desLoc.Area_ID &&
                        (rouLoc.Des_Location_ID ?? desLoc.ID.Value) == desLoc.ID.Value)
                    {
                        TreeNode<long> child = new TreeNode<long>(desLoc.ID.Value);
                        if (tree == null)
                            tree = new TreeNode<long>(souLoc.ID.Value);
                        tree.Add(child);
                    }
                }

                StaticValueManager
                    .GetInstant()
                    .Locations
                    .FindAll(x => x.Area_ID == rouLoc.Des_Area_ID && (rouLoc.Des_Location_ID ?? x.ID) == x.ID.Value)
                    .ForEach(newSouLoc =>
                    {
                        TreeNode<long> child = GetLocationRouteTree(newSouLoc, desLocs, useLocRoutes);
                        if (child != null)
                        {
                            if (tree == null)
                                tree = new TreeNode<long>(souLoc.ID.Value);
                            tree.Add(child);
                        }
                    });
            }
            return tree;
        }
    }
}
