using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class Work_ExecCmd : BaseWorkRuntime
    {
        public Work_ExecCmd(string logref) : base(logref)
        {
        }

        private string AppName { get; set; }
        protected override void OnStart()
        {
            this.AppName = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_name];
        }


        protected override void OnRun()
        {
            var cmdRms = DataADO.GetInstant().SelectBy<act_McCmdRemote>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("AppName", this.AppName), null);

            cmdRms.ForEach(cmdRm =>
            {
                if (cmdRm.CmdLine.StartsWith("/"))
                {
                    var result = new Comm_ConsoleFunction(this.LogRefID, this.BuVO)
                                        .Execute(cmdRm.CmdLine.Split(" "));
                    cmdRm.Result = result.response;
                }
                else
                {
                    var comm = cmdRm.CmdLine.Split(" ");
                    ListKeyValue<string, object> parameters = new ListKeyValue<string, object>();
                    for (int i = 2; i < comm.Length; i++)
                    {
                        string[] kv = comm[i].Split('=', 2);
                        if (kv.Length == 1)
                            parameters.Add((i - 2).ToString(), kv[0]);
                        else if (kv.Length == 2)
                            parameters.Add(kv[0], kv[1]);
                    }
                    McRuntimeController.GetInstant().PostCommand(
                        comm[0],
                        (McCommandType)int.Parse(comm[1]),
                        parameters,
                        null
                        );
                    cmdRm.Result = "OK.";
                }
                cmdRm.Status = EntityStatus.DONE;
                DataADO.GetInstant().UpdateBy<act_McCmdRemote>(cmdRm, this.BuVO);
            });
        }

        protected override void OnStop()
        {
        }
    }
}
