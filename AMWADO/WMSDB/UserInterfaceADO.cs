using AMWUtil.Logger;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class UserInterfaceADO : BaseWMSDB<UserInterfaceADO>
    {
        public List<AllMenuPage> ListMenu(int userID, VOCriteria buVO)
        {
            Dictionary<string, dynamic> selectlist = new Dictionary<string, dynamic>();

            var param = new Dapper.DynamicParameters();
            param.Add("@userid", userID);

            var res = this.Query<AllMenuPage>("SP_MENU_GETLIST", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
    }
}
