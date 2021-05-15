using ADO.WCSDB;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using AWCSEngine.Engine;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker.Model
{

    public class McThread
    {
        private Thread _McThread { get; set; }

        public int Index { get; private set; }
        public List<BaseMcRuntime> McEngines { get; private set; }
        public McThread(int index)
        {
            DisplayController.Events_Write("McThread start" + index);
            this.Index = index;
            this.McEngines = new List<BaseMcRuntime>();
        }
        public void WeekUpMcThread(ParameterizedThreadStart runMethod)
        {
            if (this._McThread == null || (this._McThread != null && !this._McThread.IsAlive))
            {
                this._McThread = new Thread(runMethod);
                this._McThread.Start(this);
            }
        }
        public void AddMc(acs_McMaster mcMst)
        {
            DisplayController.Events_Write("McThread AddMc NameEngine " + mcMst.NameEngine);
            //typeof(BaseMcRuntime).Namespace
            Type mcBaseType = ClassType.GetClassType("AWCSEngine.Engine.McRuntime" + "." + mcMst.NameEngine);
            if (mcBaseType != null)
            {
                DisplayController.Events_Write("McThread AddMc Namespace " + mcBaseType.Namespace);
            }
            else
            {
                DisplayController.Events_Write("McThread AddMc " + "typeof(BaseMcRuntime).Namespace failed");
            }
            
            Type type = ClassType.GetClassType(typeof(BaseMcRuntime).Namespace + "." + mcMst.NameEngine);
            DisplayController.Events_Write("McThread AddMc Type " + mcMst.NameEngine);
            var mcEngine = (BaseMcRuntime)Activator.CreateInstance(type, new object[] { mcMst });
            DisplayController.Events_Write("McThread AddMc create mcEngine");
            McEngines.Add(mcEngine);
            DisplayController.Events_Write("McThread AddMc add mcEngine");
            mcEngine.Initial();
            DisplayController.Events_Write("McThread AddMc initial mcEngine");
        }
        public void Abort()
        {
            if (this._McThread != null && this._McThread.IsAlive)
            {
                this._McThread.Abort();
            }
                
        }
    }
}
