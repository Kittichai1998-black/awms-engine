using ADO.WCSStaticValue;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
    public class LocationADO : BaseWCSDB<LocationADO>
    {
        public class LocIDLE
        {
            public long Area_ID;
            public string Loc_BayLv;
            public string Loc_Bay { get => this.Loc_BayLv.Substring(0, 3); }
            public string Loc_Lv { get => this.Loc_BayLv.Substring(3, 3); }
            public int Slot;
        }
        public List<acs_Location> List_FreeLocationBayLv(long whID, int slot,VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("whID", whID);
            var loc_idles = this.Query<LocIDLE>("SP_LIST_IDLE_LOCATION_BayLv",
                CommandType.StoredProcedure, parameters, buVO.Logger, buVO.SqlTransaction)
                    .OrderBy(x => x.Loc_Bay)
                    .OrderBy(x => x.Loc_Lv).ToList();

            if (slot > loc_idles.Sum(x=>x.Slot))
                throw new Exception($"เหลือพื้นที่ว่าง '{loc_idles.Sum(x => x.Slot)}' พื้นที่ไม่พอจัดเก็บ {slot}!");

            var res = new List<acs_Location>();
            foreach (var ls in loc_idles)
            {
                if (slot <= 0) break;
                var loc = 
                    StaticValueManager.GetInstant()
                        .Locations
                        .FindAll(x => x.Area_ID == ls.Area_ID && x.Code.EndsWith(ls.Loc_BayLv));
                loc = loc.OrderBy(x => x.GetBank()).ToList();
                loc.Remove(loc.First());
                loc.Remove(loc.Last());
                res.AddRange(loc);
                slot -= ls.Slot;
            }
            return res;
        }
    }
}
