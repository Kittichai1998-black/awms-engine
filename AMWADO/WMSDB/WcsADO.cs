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
        public void SP_CREATE_DO_QUEUE(string TrxRef, string DocRef,long WmsRefID, long SeqGroup ,int Priority, string Customer
            , string SkuCode, string SkuGrade, string SkuLot, decimal SkuQty, string SkuUnit
            , string SkuStatus, string Base_code, string Warehouse_Code, string Des_Area_Code
            , string Remark, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("IOType", IOType.OUTBOUND);
            parameters.Add("TrxRef", TrxRef);
            parameters.Add("DocRef", DocRef);
            parameters.Add("Wms_Ref_ID", WmsRefID);
            parameters.Add("SeqGroup", SeqGroup);
            parameters.Add("Priority", Priority);
            parameters.Add("Customer", Customer);
            /*parameters.Add("SkuCode", SkuCode);
            parameters.Add("SkuGrade", SkuGrade);
            parameters.Add("SkuLot", SkuLot);
            parameters.Add("SkuQty", SkuQty);
            parameters.Add("SkuUnit", SkuUnit);
            parameters.Add("SkuStatus", SkuStatus);*/
            parameters.Add("Base_code", Base_code);
            parameters.Add("Warehouse_Code", Warehouse_Code);
            parameters.Add("Des_Area_Code", Des_Area_Code);
            parameters.Add("Remark", Remark);
            parameters.Add("rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_CREATE_DO_QUEUE]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@rtFlag");
            string rtDesc = parameters.Get<string>("@rtDesc");

            if (rtFlag != "1")
            {
                throw new Exception(rtDesc);
            }
        }

        public void SP_CREATEBUWORK(long wms_ref_id, string trxRef, string docRef, string customer, string skuCode, string skuGrade, string skuLot,
            decimal skuQty, string skuUnit, string skuStatus, decimal buQty, int itemNoStart, int itemNoEnd, 
            string desWarehouseCode, string desAreaCode,
            string discharge, string remark, string bayLevelKeep, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@IOType", IOType.INBOUND);
            parameters.Add("@wms_ref_id", wms_ref_id);
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
            parameters.Add("@Des_Area_Code", desAreaCode);
            parameters.Add("@DisCharge", discharge);
            parameters.Add("@Remark", remark);
            parameters.Add("@Bay_Level_Keep", bayLevelKeep);
            parameters.Add("@rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_CREATEBUWORK]", parameters, buVO);
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
            parameters.Add("@iType", ioType);
            parameters.Add("@sTrxRef", trxRef);
            parameters.Add("@status", "", System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            parameters.Add("@message", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_Receive_Close]", parameters, buVO);
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
            parameters.Add("@rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_CreateBaseObject]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@rtFlag");
            string rtDesc = parameters.Get<string>("@rtDesc");

            if (rtFlag != "Y")
            {
                throw new Exception(rtDesc);
            }
        }
        public void SP_QUEUE_ARRANGEBAY(string warehouse_code, int bay, int level, int arrange_type, out string arrange_no, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@warehouse_code", warehouse_code);
            parameters.Add("@bay", bay);
            parameters.Add("@level", level);
            parameters.Add("@arrange_type", arrange_type);

            parameters.Add("@arrange_id", "", System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            parameters.Add("@arrange_no", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@arrange_result", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@arrange_status", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_QUEUE_ARRANGEBAY]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@arrange_status");
            string rtDesc = parameters.Get<string>("@arrange_result");
            arrange_no = parameters.Get<string>("@arrange_no");

            if (rtFlag != "IN PROGRESS")
            {
                throw new Exception(rtDesc);
            }
        }

        public void SP_CANCEL_QUEUE_ARRANGE(string arrange_no, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@arrange_no", arrange_no);
            ADO.WCSDB.DataADO.GetInstant().QuerySP(
                "[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_CANCEL_QUEUE_ARRANGE]", parameters, buVO);
        }



        public void SP_QUEUE_COUNTBAY(string warehouse_code, int bay, int level,int count_type,out string count_no, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@warehouse_code", warehouse_code);
            parameters.Add("@bay", bay);
            parameters.Add("@level", level);
            parameters.Add("@count_type", count_type);

            parameters.Add("@count_id", "", System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            parameters.Add("@count_no", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@count_result", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@count_status", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_QUEUE_COUNTBAY]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@count_status");
            string rtDesc = parameters.Get<string>("@count_result");
            count_no = parameters.Get<string>("@count_no");

            if (rtFlag != "IN PROGRESS")
            {
                throw new Exception(rtDesc);
            }
        }

        public void SP_CANCEL_QUEUE_COUNT(string count_no, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@count_no", count_no);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_CANCEL_QUEUE_COUNT]", parameters, buVO);

        }


        public void SP_ShuttleBatteryFull(string shuttle, string location, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@SH_NAME", shuttle);
            parameters.Add("@SS_NAME", location);

            parameters.Add("@rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);

            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_ShuttleBatteryFull]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@rtFlag");
            string rtDesc = parameters.Get<string>("@rtDesc");

            if (rtFlag != "Y")
            {
                throw new Exception(rtDesc);
            }
        }
        public void SP_ShuttelToStand(string shuttle, VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("@SH_NAME", shuttle);

            parameters.Add("@rtFlag", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            parameters.Add("@rtDesc", "", System.Data.DbType.String, System.Data.ParameterDirection.Output);
            ADO.WCSDB.DataADO.GetInstant().QuerySP("[ACS_GCL_" + buVO.SqlConnection.Database.Split("_").Last() + "].[dbo].[SP_ShuttelToStand]", parameters, buVO);
            string rtFlag = parameters.Get<string>("@rtFlag");
            string rtDesc = parameters.Get<string>("@rtDesc");

            if (rtFlag != "Y")
            {
                throw new Exception(rtDesc);
            }
        }


    }
}
