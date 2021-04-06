using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
    public class DashboardADO : BaseWCSDB<DashboardADO>
    {
        public List<dynamic> Dashboard_ReportOrder(IOType io, long whID, int max, VOCriteria buVO)
        {
            DynamicParameters parameter = new DynamicParameters();
            parameter.Add("io", io);
            parameter.Add("whID", whID);
            parameter.Add("max", max);
            var res = this.Query<dynamic>("RP_Dashboard_Receive_Order",
                CommandType.StoredProcedure, parameter, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

        public List<dynamic> Dashboard_EventLog(string app, string mc, int max, VOCriteria buVO)
        {
            DynamicParameters parameter = new DynamicParameters();
            parameter.Add("app", app);
            parameter.Add("mc", mc);
            parameter.Add("max", max);
            var res = this.Query<dynamic>("RP_Dashboard_EventLog",
                CommandType.StoredProcedure, parameter, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }
    }
}
