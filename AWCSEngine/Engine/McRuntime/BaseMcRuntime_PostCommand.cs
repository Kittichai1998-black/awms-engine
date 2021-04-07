using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public abstract partial class BaseMcRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        public bool PostCommand(McCommandType comm)
        {
            return this.PostCommand(comm, null, null, () => { });
        }
        public bool PostCommand(McCommandType comm, ListKeyValue<string, object> parameters)
        {
            return this.PostCommand(comm, parameters, null, () => { });
        }


        public bool PostCommand(McCommandType comm,
            Action callback_CommandSetted)
        {
            return this.PostCommand(comm, null, null, callback_CommandSetted);
        }
        public bool PostCommand(McCommandType comm,
            Func<BaseMcRuntime, LoopResult> callback_OnChange)
        {
            return this.PostCommand(comm, null, callback_OnChange, ()=> { });
        }

        public bool PostCommand(McCommandType comm, Func<BaseMcRuntime, LoopResult> callback_OnChange,
            Action callback_CommandSetted)
        {
            return this.PostCommand(comm, null, callback_OnChange, callback_CommandSetted);
        }
        public bool PostCommand(McCommandType comm,ListKeyValue<string,object> parameters, 
            Func<BaseMcRuntime, LoopResult> callback_OnChange)
        {
            return this.PostCommand(comm, parameters, callback_OnChange, ()=> { });
        }

        public bool PostCommand(McCommandType comm,
            int Set_SouLoc, int Set_DesLoc, int Set_Unit, string Set_PalletID, int Set_Weigh,
            Func<BaseMcRuntime, LoopResult> callback_OnIDLE,
            Action callback_CommandSetted)
        {
            return this.PostCommand(comm, ListKeyValue<string, object>
                            .New("Set_SouLoc", Set_SouLoc)
                            .Add("Set_DesLoc", Set_DesLoc)
                            .Add("Set_Unit", Set_Unit)
                            .Add("Set_PalletID", Set_PalletID)
                            .Add("Set_Weigth", Set_Weigh), callback_OnIDLE, callback_CommandSetted);
        }

        public bool PostCommand(McCommandType comm,
            int Set_SouLoc, int Set_DesLoc, int Set_Unit, string Set_PalletID, int Set_Weigh,
            Action callback_CommandSetted)
        {
            return this.PostCommand(comm, Set_SouLoc, Set_DesLoc, Set_Unit, Set_PalletID, Set_Weigh,
                null, callback_CommandSetted);
        }
        public bool PostCommand(McCommandType comm,
          int Set_SouLoc, int Set_DesLoc, int Set_Unit, string Set_PalletID, int Set_Weigh,
            Func<BaseMcRuntime, LoopResult> callback_OnIDLE)
        {
            return this.PostCommand(comm, Set_SouLoc, Set_DesLoc, Set_Unit, Set_PalletID, Set_Weigh,
                callback_OnIDLE, ()=> { });
        }

        public bool PostCommand(McCommandType comm, ListKeyValue<string, object> parameters,
            Action callback_CommandSetted)
        {
            return this.PostCommand(comm, parameters, null, callback_CommandSetted);
        }

        public bool PostCommand(McCommandType comm, ListKeyValue<string, object> parameters,
            Func<BaseMcRuntime, LoopResult> callback_OnIDLE,
            Action callback_CommandSetted)
        {
            if (_Callback_OnChanges == null) _Callback_OnChanges = new List<Func<BaseMcRuntime, LoopResult>>();

            if ((int)comm == 0)
            {
                this.Logger.LogInfo("[CMD] > Clear!");
                DisplayController.Events_Write(this.Code + " > [CMD] Clear!");
                this.McObj.Command_ID = null;
                this.McObj.CommandAction_Seq = null;
                this.McObj.CommandParameter = null;
                this.McObj.EventStatus = McObjectEventStatus.IDEL;
                this.StepTxt = string.Empty;
                //this._Callback_OnChange = null;
                return true;
            }
            else if (this.McObj.EventStatus == McObjectEventStatus.IDEL)
            {
                this.Logger.LogInfo("[CMD] > Post " + comm.ToString() + " " +
                    (parameters == null ? string.Empty : parameters.Items.Select(x => x.Key + "=" + x.Value).JoinString('&')));
                DisplayController.Events_Write(this.Code + " > [CMD] Post= "+ (int)comm+" : " + GetTextCommand((int)comm) + " // PST= "+ this.McObj.DV_Pre_Status+" : " + GetTextStatus(this.McObj.DV_Pre_Status));
                this.McObj.Command_ID = StaticValueManager.GetInstant().GetMcCommand(this.McMst.ID.Value, comm).ID.Value;
                this.McObj.CommandAction_Seq = 1;
                this.McObj.CommandParameter = parameters == null ? string.Empty : parameters.ToQryStr();
                this.McObj.CommandActionTime = DateTime.Now;
                this.McObj.EventStatus = McObjectEventStatus.COMMAND_CONDITION;
                //this.StepTxt = string.Empty;
                if (callback_OnIDLE != null)
                {
                    //this._Callback_OnChanges.Clear();
                    this._Callback_OnChanges.Add(callback_OnIDLE);
                }

                if (callback_CommandSetted != null)
                    callback_CommandSetted();

                return true;
            }

            return false;
        }

    }
}
