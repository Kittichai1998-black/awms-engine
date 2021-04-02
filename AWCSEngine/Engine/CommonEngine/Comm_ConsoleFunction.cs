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
    public class Comm_ConsoleFunction : BaseCommonEngine<string[], string>
    {
        public Comm_ConsoleFunction(string logref, VOCriteria buVO) : base(logref, buVO)
        {
        }

        protected override string ExecuteChild(string[] comm)
        {
            var md = this.GetType().GetMethod("fn_"+comm[0].ToLower().Substring(1));
            if (md == null) throw new Exception("[ERROR] Command Not Found.");
            var p = comm.ToList();
            p.RemoveAt(0);
            string[] args = p.Select(x => (string)x).ToArray();
            object res = md.Invoke(this, args.Select(x => (object)x).ToArray());

            return res.ToString();
        }

        public string fn_auto(string machine)
        {
            McRuntimeController.GetInstant().GetMcRuntime(machine).SetAuto(true);
            return "OK.";
        }
        public string fn_manual(string machine)
        {
            McRuntimeController.GetInstant().GetMcRuntime(machine).SetAuto(false);
            return "OK.";
        }
        public string fn_on(string machine)
        {
            McRuntimeController.GetInstant().GetMcRuntime(machine).SetOnline(true);
            return "OK.";
        }
        public string fn_off(string machine)
        {
            McRuntimeController.GetInstant().GetMcRuntime(machine).SetOnline(false);
            return "OK.";
        }
        public string fn_loadstatic()
        {
            StaticValueManager.GetInstant().LoadAll();
            return "OK.";
        }
        public string fn_step(string machine, string step = "")
        {
            Controller.McRuntimeController.GetInstant().GetMcRuntime(machine).StepTxt = step;
            return "OK.";
        }
        public string fn_location(string machine, string wh_code, string loc_code)
        {
            var mc = McRuntimeController.GetInstant().GetMcRuntime(machine);
            var loc = StaticValueManager.GetInstant().GetLocation(wh_code, loc_code.Get2<int>().ToString("000000000"));
            mc.McObj.Cur_Location_ID = loc.ID.Value;
            return "OK.";
        }
        public string fn_reset(string machine)
        {
            McRuntimeController.GetInstant().GetMcRuntime(machine).Reload();
            return "OK.";
        }

        public string fn_help(string method = "")
        {
            string res = "{srm} {command} {sou} {des} {unit} {pallet}\n";
            res += "{shu} 1 {sou} {shi_di}\n";
            if (string.IsNullOrEmpty(method) || method == "all")
            {
                foreach(var md in this.GetType().GetMethods()){
                    if (md.Name.StartsWith("fn_"))
                    {
                        res += $"/{md.Name.Substring(3)} ";
                        foreach (var pm in md.GetParameters())
                        {
                            res += $"{{{pm.Name}}} ";
                        }
                        res += "\n";
                    }
                }
            }

            return res;
        }
        public string fn_wq(string machine, string action, string next_machine = "")
        {
            var mc = Controller.McRuntimeController.GetInstant().GetMcRuntime(machine);
            if (action == "working")
            {
                mc.McWork_1_ReceiveToWorking();
            }
            else if (action == "worked")
            {
                mc.McWork_2_WorkingToWorked();
            }
            else if (action == "keep")
            {
                mc.McWork_3_WorkedToKeep();
            }
            else if (action == "next")
            {
                var next_mc = Controller.McRuntimeController.GetInstant().GetMcRuntime(next_machine);
                mc.McWork_3_WorkedToReceive_NextMC(next_mc.ID);
            }
            else if (action == "done")
            {
                mc.McWork_4_WorkedToDone();
            }
            else
            {
                throw new Exception("{action} not found.");
            }
            return "OK.";
        }

        /*  private void CommandCallFunction(string _comm)
           {
               else if (comm[0].ToLower().Equals("/loc"))
               {
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
