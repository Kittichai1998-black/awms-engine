using ADO.WCSStaticValue;
using AMSModel.Criteria;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class Comm_ConsoleFunction : BaseCommonEngine<string[], NullCriteria>
    {
        public Comm_ConsoleFunction(string logref, VOCriteria buVO) : base(logref, buVO)
        {
        }

        protected override NullCriteria ExecuteChild(string[] comm)
        {
            var md = this.GetType().GetMethod("fn_"+comm[0].ToLower().Substring(1));
            if (md == null) throw new Exception("Command Not Found.");
            var p = comm.ToList();
            p.RemoveAt(0);
            string[] args = p.Select(x => (string)x).ToArray();
            md.Invoke(this, new object[] { args });

            return new NullCriteria();
        }

        private void fn_auto(string[] args)
        {
            McRuntimeController.GetInstant().GetMcRuntime(args[0]).SetAuto(args[1].ToLower().In("1", "true", "y"));
        }
        private void fn_online(string[] args)
        {
            McRuntimeController.GetInstant().GetMcRuntime(args[0]).SetOnline(args[1].ToLower().In("1", "true", "y"));
        }

        /* private void CommandCallFunction(string _comm)
         {
             string[] comm = _comm.Trim().Split(" ");

             if (comm[0].ToLower() == "/auto")
             {
             }
             else if (comm[0].ToLower() == "/online")
             {
                 McRuntimeController.GetInstant().GetMcRuntime(comm[1]).SetOnline(comm[2].ToLower().In("1", "true", "y"));
             }
             else if (comm[0].ToLower().Equals("/loadstatic"))
             {
                 StaticValueManager.GetInstant().LoadAll();
             }
             else if (comm[0].ToLower().Equals("/mc clearstep"))
             {
                 Controller.McRuntimeController.GetInstant().GetMcRuntime(comm[1]).StepTxt = string.Empty;
             }
             else if (comm[0].ToLower().Equals("/mc reload"))
             {
                 Controller.McRuntimeController.GetInstant().GetMcRuntime(comm[1]).StepTxt = string.Empty;
             }
             else if (comm[0].ToLower().Equals("/loc"))
             {
                 var mc = McRuntimeController.GetInstant().GetMcRuntime(comm[1]);
                 var loc = StaticValueManager.GetInstant().GetLocation(comm[2]);
                 if (loc == null)
                     this.lisDisplayCommand.Items.Add("Location Not Found!");
                 else if (mc == null)
                     this.lisDisplayCommand.Items.Add("McRuntime Not Found!");
                 else
                 {
                     mc.McObj.Cur_Location_ID = loc.ID.Value;
                 }
             }
             else if (comm[0].ToLower().Equals("/baseobj"))
             {
                 if (comm[1].ToLower().Equals("new"))
                 {
                     string baseCode = comm[2];
                     string locCode = comm[3];
                     string evtStatus = comm.Length < 5 ? "idle" : comm[4];

                     var loc = StaticValueManager.GetInstant().GetLocation(locCode);
                     var mc = DataADO.GetInstant().SelectBy<act_McObject>("Cur_Location_ID", loc.ID.Value, null).FirstOrDefault();

                     ADO.WCSDB.DataADO.GetInstant().Insert<act_BaseObject>(new act_BaseObject()
                     {
                         Code = baseCode,
                         Area_ID = loc.Area_ID,
                         Location_ID = loc.ID.Value,
                         LabelData = null,
                         Model = null,
                         McObject_ID = mc.ID,
                         SkuCode = "TEST01",
                         SkuName = "TEST01",
                         SkuQty = 1000,
                         SkuUnit = "kg",
                         WeiKG = 1000,
                         Status = EntityStatus.ACTIVE,
                         Options = null,
                         EventStatus = evtStatus.ToLower() == "idle" ? BaseObjectEventStatus.IDLE :
                                         evtStatus.ToLower() == "move" ? BaseObjectEventStatus.MOVE :
                                          BaseObjectEventStatus.TEMP
                     }, null);
                 }
             }
             else if (comm[0].ToLower().Equals("/mcwork"))
             {
                 if (comm[1].ToLower().Equals("test-inbound"))
                 {
                     string mcCode = comm[2];
                     string desCode = comm[3];
                     string baseCode = comm[4];
                     var mc = Controller.McRuntimeController.GetInstant().GetMcRuntime(mcCode);

                     ADO.WCSDB.DataADO.GetInstant().Insert<act_BaseObject>(new act_BaseObject()
                     {
                         Code = baseCode,
                         Area_ID = mc.Cur_Area.ID.Value,
                         Location_ID = mc.Cur_Location.ID.Value,
                         LabelData = null,
                         Model = null,
                         McObject_ID = mc.ID,
                         SkuCode = "TEST01",
                         SkuName = "TEST01",
                         SkuQty = 1000,
                         SkuUnit = "kg",
                         WeiKG = 1000,
                         Status = EntityStatus.ACTIVE,
                         Options = null,
                         EventStatus = BaseObjectEventStatus.IDLE
                     }, null);
                     var baseObj = BaseObjectADO.GetInstant().GetByCode(baseCode, null);
                     var desLoc = StaticValueManager.GetInstant().GetLocation(desCode);
                     //var treeRouting = LocationUtil.GetLocationRouteTree(mc.Cur_Location.ID.Value, desLoc.Area_ID, desLoc.ID);
                     DataADO.GetInstant().Insert<act_McWork>(new act_McWork()
                     {
                         Priority = 10,
                         SeqGroup = 0,
                         SeqItem = 0,
                         BaseObject_ID = baseObj.ID.Value,
                         WMS_WorkQueue_ID = null,
                         Cur_McObject_ID = null,
                         Rec_McObject_ID = mc.ID,
                         Cur_Warehouse_ID = mc.Cur_Area.Warehouse_ID,
                         Cur_Area_ID = mc.Cur_Area.ID.Value,
                         Cur_Location_ID = mc.Cur_Location.ID.Value,
                         Sou_Area_ID = mc.Cur_Area.ID.Value,
                         Sou_Location_ID = mc.Cur_Location.ID.Value,
                         Des_Area_ID = desLoc.Area_ID,
                         Des_Location_ID = desLoc.ID.Value,
                         StartTime = DateTime.Now,
                         ActualTime = DateTime.Now,
                         EndTime = null,
                         TreeRoute = "",//treeRouting.Json(),
                         EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                         Status = EntityStatus.ACTIVE
                     }, null);


                     mc.McWork_0_Reload();
                 }
             }

         }*/
    }
}
