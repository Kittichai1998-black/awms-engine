using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
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
            this.wkDisplay.RunWorkerAsync();
        }
        

        private void wkDisplay_DoWork(object sender, DoWorkEventArgs e)
        {
            while (true)
            {
                if (this.IsHandleCreated)
                    this.lisDisplayEngine.Invoke((MethodInvoker)(() => {
                        this.lisDisplayEngine.Items.Clear();
                        this.lisDisplayEngine.Items.AddRange(McRuntimeController.GetInstant().ListMessageLog());
                    }));

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
                if (this.txtCommand.Text.StartsWith("/"))
                {
                    CommandCallFunction(this.txtCommand.Text);
                    return;
                }
                this.lisDisplayCommand.Items.Insert(0, "COMMAND > " + this.txtCommand.Text);
                string[] comm = this.txtCommand.Text.Split(' ');
                if (comm.Length < 2)
                {
                    this.lisDisplayCommand.Items.Insert(0, "ERROR > รูปแบบคำสั่งไม่ถูกต้อง [machine] [command] [location1] [location2]");
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
                        McRuntimeController.GetInstant().PostCommand(
                            comm[0],
                            (McCommandType)int.Parse(comm[1]),
                            parameters,
                            (x)=> {
                                SetText(x.Code + " > " + x.EventStatus + " > Cmd:" + 
                                    (int)x.RunCmd.McCommandType + " | Codition:" + 
                                    x.RunCmdActions.Select(y => y.Seq + "." + y.DKV_Condition).First());

                                void SetText(string txt) {
                                    if (this.IsHandleCreated)
                                        this.lisDisplayEngine.Invoke((MethodInvoker)(() =>
                                        {
                                            this.lisDisplayCommand.Items.Add(txt);
                                        }));
                                    else
                                        SetText(txt);
                                }
                            });
                        this.txtCommand.Text = comm[0] + " ";
                    }
                    catch (Exception ex)
                    {
                        this.lisDisplayCommand.Items.Insert(0, "ERROR > " + ex.Message);
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

        private void CommandCallFunction(string _comm) {
            string[] comm = _comm.Trim().Split(" ");
            
            if(comm[0].ToLower().Equals("/baseobj"))
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
                if (comm[1].ToLower().Equals("new"))
                {
                    string baseCode = comm[2];
                    string desLocCode = comm[3];
                    var baseObj = BaseObjectADO.GetInstant().GetByCode(baseCode, null);
                    var desLoc = StaticValueManager.GetInstant().GetLocation(desLocCode);
                    DataADO.GetInstant().Insert<act_McWork>(new act_McWork()
                    {
                        Status = EntityStatus.INACTIVE,
                        WMS_WorkQueue_ID=-1,
                        Area_ID = baseObj.Area_ID,
                        Location_ID = baseObj.Location_ID,
                        Sou_Area_ID = baseObj.Area_ID,
                        Sou_Location_ID = baseObj.Location_ID,
                        Des_Area_ID = desLoc.Area_ID,
                        Des_Location_ID = desLoc.ID.Value,
                        BaseObject_ID = baseObj.ID.Value,
                        TreeRoute = ""
                    }, null);

                }
            }
        
        }
    }
}
