using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using AWCSEngine.Util;
using AWCSEngine.Worker;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace AWCSEngine
{
    public partial class formConsole : Form
    {
        public formConsole()
        {
            InitializeComponent();
        }
        private void formAdminConsole_Load(object sender, EventArgs e)
        {
            this.lisDisplayCommand.Click += LisDisplayCommand_Click;
            this.lisDisplayCommand.Items.Add("{machine} {command} {p1} {p2} {p3}");
            this.lisDisplayCommand.Items.Add("{srm} {command} {sou} {des} {unit} {pallet} {weigth}");
            this.lisDisplayCommand.Items.Add("/mcwork all {machine} {des_loc} {pallet}");
            this.lisDisplayCommand.Items.Add("-------------------------------------");


            this.lisDisplayDevices.Items.Add("<<====== Devices ======>>");
            this.lisDisplayMcLists.Items.Add("<<====== Machines ======>>");
            this.lisDisplayEvents.Items.Add("<<====== Events ======>>");

            this.wkDisplay.RunWorkerAsync();
        }

        private void LisDisplayCommand_Click(object sender, EventArgs e)
        {
            string[] txt = this.lisDisplayCommand.Text.Split('>', 2);
            if (txt.Length == 2)
                this.txtCommand.Text = txt[1];
        }

        private string McCode_ReadDeive = string.Empty;


        private void lisDisplayMcLists_Add(string txt)
        {
            if (this.lisDisplayMcLists.IsHandleCreated)
            {
                this.lisDisplayMcLists.Invoke((MethodInvoker)(() => {
                    this.lisDisplayMcLists.Items.Add(txt);
                }));
            }
        }
        private void lisDisplayEvents_Add(string txt)
        {
            if (this.lisDisplayEvents.IsHandleCreated)
            {
                this.lisDisplayEvents.Invoke((MethodInvoker)(() => {
                    this.lisDisplayEvents.Items.Add(txt);
                }));
            }
        }
        private void wkDisplay_DoWork(object sender, DoWorkEventArgs e)
        {

            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (000%) 1.ThreadMcRuntime.Initial Connecting..."));
            ThreadMcRuntime.GetInstant().Initial();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (025%) 1.ThreadMcRuntime.Initial Connected!!!"));

            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (030%) 2.ThreadWorkRuntime.Initial Connecting..."));
            ThreadWorkRuntime.GetInstant().Initial();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (050%) 2.ThreadWorkRuntime.Initial Connected!!!"));

            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (055%) 3.lisDisplayEvents.Initial Connecting..."));
            ThreadAPIFileRuntime.GetInstant().Initial();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (075%) 3.lisDisplayEvents.Initial Connected!!!"));

            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (080%) 4.lisDisplayEvents.Initial Connecting..."));
            ThreadWakeUp.GetInitial().Initial();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, "System > (100%) 4.lisDisplayEvents.Initial Connected!!!"));



            while (true)
            {
                if (this.IsHandleCreated)
                {
                    this.lisDisplayMcLists.Invoke((MethodInvoker)(() => {
                        foreach (var msg in DisplayController.McLists_Reading())
                        {
                            if (this.lisDisplayMcLists.Items.Count < msg.Key + 1)
                                for (int i = 0; i < (msg.Key + 1) - this.lisDisplayMcLists.Items.Count; i++)
                                    this.lisDisplayMcLists.Items.Add(string.Empty);

                            this.lisDisplayMcLists.Items[msg.Key] = msg.Value;
                        }
                    }));
                    this.lisDisplayEvents.Invoke((MethodInvoker)(() => {
                        if (this.lisDisplayEvents.Items.Count > 100)
                            for (int i = 0; i < 50; i++)
                                this.lisDisplayEvents.Items.RemoveAt(1);
                        foreach (var msg in DisplayController.Events_Reading())
                        {
                            this.lisDisplayEvents.Items.Add(string.Format("{0:hh:mm:ss:fff} {1}", DateTime.Now, msg));
                        }
                    }));
                    this.lisDisplayDevices.Invoke((MethodInvoker)(() =>
                    {
                        this.lisDisplayDevices.Items.Clear();
                        if (!string.IsNullOrEmpty(this.McCode_ReadDeive))
                        {
                            var mc = Controller.McRuntimeController.GetInstant().GetMcRuntime(this.McCode_ReadDeive);
                            if (mc == null)
                            {
                                this.lisDisplayDevices.Items.Add(this.McCode_ReadDeive + " : (Not Found.)");
                            }
                            else
                            {
                                this.lisDisplayDevices.Items.Add(this.McCode_ReadDeive + " : " +
                                    (mc.McObj.IsOnline ? "Online." : "Offile!") + " / " +
                                    (mc.McObj.IsAuto ? "Auto" : "Manual"));
                                this.lisDisplayDevices.Items.AddRange(mc.DeviceLogs.ToArray());
                            }
                        }
                    }));
                     
                }

                Thread.Sleep(500);
            }
        }

        private void wkDisplay_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
        }

        private void formAdminConsole_FormClosing(object sender, FormClosingEventArgs e)
        {
        }

        private void txtCommand_KeyDown(object sender, KeyEventArgs e)
        {
            if(e.KeyCode == Keys.Enter)
            {
                string command = this.txtCommand.Text;
                this.lisDisplayCommand.Items.Add("COMMAND > " + command);
                this.txtCommand.Text = string.Empty;

                if (command.StartsWith("/"))
                {
                    CommandCallFunction(command);
                    return;
                }
                string[] comm = command.Split(' ');
                if (comm.Length < 2)
                {
                    this.lisDisplayCommand.Items.Add( "ERROR > รูปแบบคำสั่งไม่ถูกต้อง [machine] [command] [location1] [location2]");
                }
                else
                {
                    try
                    {
                        ListKeyValue<string, object> parameters = new ListKeyValue<string, object>();
                        for (int i = 2; i < comm.Length; i++)
                        {
                            string[] kv = comm[i].Split('=', 2);
                            if (kv.Length == 1)
                                parameters.Add((i - 2).ToString(), kv[0]);
                            else if(kv.Length == 2)
                                parameters.Add(kv[0], kv[1]);
                        }

                        if (comm[1].ToLower().In("auto","online","view"))
                        {
                            if (comm[1].ToLower() == "auto")
                            {
                                McRuntimeController.GetInstant().GetMcRuntime(comm[0]).SetAuto(comm[2].ToLower().In("1", "true", "y"));
                            }
                            else if (comm[1].ToLower() == "online")
                            {
                                McRuntimeController.GetInstant().GetMcRuntime(comm[0]).SetOnline(comm[2].ToLower().In("1", "true", "y"));
                            }
                            else if (comm[1].ToLower() == "view")
                            {
                                this.McCode_ReadDeive = comm[0];
                            }
                        }
                        else
                        {
                            McRuntimeController.GetInstant().PostCommand(
                                comm[0],
                                (McCommandType)int.Parse(comm[1]),
                                parameters,
                                null
                                );
                        }
                    }
                    catch (Exception ex)
                    {
                        this.lisDisplayCommand.Items.Add ("COMMAND > ERROR : " + ex.Message);
                    }
                }
            }
        }

        private void formConsole_FormClosed(object sender, FormClosedEventArgs e)
        {
            Environment.Exit(0);
        }

        private void btnHotCmd_Click(object sender, EventArgs e)
        {
            Form form = new Form();
            ListBox lisBox = new ListBox();

            form.Text = "Hot Key";
            lisBox.Items.Add("เก็บ,เบิก | SRM11 21 2048002 2041001 1 PL00001000 1000");


            form.ClientSize = new Size(950, 247);
            form.Controls.AddRange(new Control[] { lisBox});
            form.ClientSize = new Size(Math.Max(700, lisBox.Right + 10), form.ClientSize.Height);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MinimizeBox = false;
            form.MaximizeBox = false;

            DialogResult dialogResult = form.ShowDialog();
            if(dialogResult == DialogResult.OK)
            {

            }
        }
        private void CommandCallTestCase(string caseNo)
        {
            switch (caseNo)
            {
               // case "1":CommandCallFunction($"/mcwork new {new Random().Next(0,9999999):0000000000} 002048002");
                default:return;
            }
        }
        private void CommandCallFunction(string _comm) {
            string[] comm = _comm.Trim().Split(" ");

            if (comm[0].ToLower().Equals("/test"))
            {
                CommandCallTestCase(_comm);
            }
            else if(comm[0].ToLower().Equals("/baseobj"))
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
                        Location_ID= loc.ID.Value,
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
                        EventStatus = evtStatus.ToLower() == "idle"? BaseObjectEventStatus.IDLE:
                                        evtStatus.ToLower() == "move"? BaseObjectEventStatus.MOVE:
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
                        Priority = PriorityType.NORMAL,
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
        
        }

        private void menuMain_ItemClicked(object sender, ToolStripItemClickedEventArgs e)
        {
            if(e.ClickedItem.Text == "Config Command")
            {
                formConfigCommand fm = new formConfigCommand();
                fm.Show();
            }
        }
    }
}
