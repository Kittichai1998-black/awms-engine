using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class WcsADO:BaseAPI<WcsADO>
    {
        public void SP_CREATEBUWORK(string trxRef, string docRef, string customer, string skuCode, string skuGrade, string skuLot,
            decimal skuQty, string skuUnit, string skuStatus, decimal buQty, int itemNoStart, int itemNoEnd, string desWarehouseCode,
            string discharge, string remark, string bayLevelKeep, VOCriteria buVO)
        {

            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@IOType", IOType.INBOUND);
            parameters.Add("@TrxRef", trxRef);
            parameters.Add("@DocRef", docRef);
            parameters.Add("@Priority", 1);
            parameters.Add("@Customer", customer);
            parameters.Add("@SkuCode", skuCode);
            parameters.Add("@SkuGrade", skuGrade);
            parameters.Add("@SkuLot", skuLot);
            parameters.Add("@SkuQty", skuQty);
            parameters.Add("@SkuUnit", skuUnit);
            parameters.Add("@SkuStatus", skuStatus);
            parameters.Add("@BuQty", buQty);
            parameters.Add("@ItemNoStart", itemNoStart);
            parameters.Add("@ItemNoEnd", itemNoEnd);
            parameters.Add("@Des_Warehouse_Code", desWarehouseCode);
            parameters.Add("@DisCharge", discharge);
            parameters.Add("@Remark", remark);
            parameters.Add("@Bay_Level_Keep", bayLevelKeep);
            parameters.Add("@rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[dbo].[SP_CREATEBUWORK]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@rtFlag");
            string rtDesc = parameters.Get<string>("@rtDesc");

            if (rtFlag != "Y")
            {
                throw new Exception(rtDesc);
            }
        }

        public void SP_Receive_Close(IOType ioType,string trxRef, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@iType", IOType.INBOUND);
            parameters.Add("@sTrxRef", trxRef);
            parameters.Add("@status", "", System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            parameters.Add("@message", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[dbo].[SP_Receive_Close]", parameters, buVO);
            int status = parameters.Get<int>("@status");
            string message = parameters.Get<string>("@message");

            if (status != 1)
            {
                throw new Exception(message);
            }
        }

        public void SP_CreateBaseObject(string sLabelData, string sStation_keep, VOCriteria buVO)
        {

            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@sLabelData", sLabelData);
            parameters.Add("@sStation_keep", sStation_keep);
            parameters.Add("@message", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[dbo].[SP_CreateBaseObject]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@rtFlag");
            string rtDesc = parameters.Get<string>("@rtDesc");

            if (rtFlag != "Y")
            {
                throw new Exception(rtDesc);
            }
        }
    }
}
