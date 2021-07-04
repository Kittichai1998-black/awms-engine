using ADO.WMSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AWMSEngine.Controllers.V2;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A10_2_WCS_Post_Command_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TReq
        {
            public string app_name;
            public string command;
        }

        public A10_2_WCS_Post_Command_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            string db_env = BuVO.SqlConnection.Database.Split("_").Last();
            string mc_name = (req.command.StartsWith("/") ? req.command.Split(' ')[1] : req.command.Split(' ').First()).ToUpper();

            dynamic mcMst = DataADO.GetInstant().QueryString<dynamic>
                (@$"select AppName from [ACS_GCL_{db_env}].[dbo].acs_McMaster where code='{mc_name}' ", null, BuVO).FirstOrDefault();
            if (mcMst == null)
                throw new Exception($"ไม่พบ Machine '{mc_name}'");
            string app_name = mcMst.AppName;
            req.app_name = app_name;

            DataADO.GetInstant().QueryString<dynamic>
                (@$"insert into [ACS_GCL_{db_env}].[dbo].act_McCmdRemote(WmsRefID,AppName,CmdLine,Status,CreateBy,CreateTime)
                    values('{this.Logger.LogRefID}','{req.app_name}','{req.command}',1,99,getdate())", null, BuVO);
            CommitTransaction();
            int count = 0;
            do
            {
                Thread.Sleep(500);

                var res =
                    DataADO.GetInstant().QueryString<act_McCmdRemote>
                    (@$"select top(1) * from [ACS_GCL_{db_env}].[dbo].act_McCmdRemote where WmsRefID='{this.Logger.LogRefID}' order by id desc ",
                    null, BuVO).FirstOrDefault();

                if (res.Status == EntityStatus.DONE && !res.Result.StartsWith("OK"))
                    throw new Exception(res.Result);
                else if(res.Status == EntityStatus.DONE && res.Result.StartsWith("OK"))
                    return new TRES__return();
                count++;
            } while (count < 20);

            DataADO.GetInstant().QueryString<dynamic>
                (@$"update [ACS_GCL_{db_env}].[dbo].act_McCmdRemote 
                    set status=2,Result='ERROR' where WmsRefID='{this.Logger.LogRefID}' ", null, BuVO);

            throw new Exception("WCS Response Time Out");
        }
    }
}
