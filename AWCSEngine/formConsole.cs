using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using AWCSEngine.Engine.CommonEngine;
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
        public static string AppName;
        public formConsole()
        {
            InitializeComponent();
        }
        private void formAdminConsole_Load(object sender, EventArgs e)
        {
            this.splitContainer2.SplitterDistance = (int)((float)this.Width * 0.6f);
            AppName = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_name];
            this.Text = AppName;


            this.lisDisplayCommand.Items.Add("{machine} {command} {p1} {p2} {p3}");
            this.lisDisplayCommand.Items.Add("{srm} {command} {sou} {des} {unit} {pallet} {weigth}");
            this.lisDisplayCommand.Items.Add("{shu} {comm} {sou} {sht_di}");

            this.lisDisplayCommand.Items.Add("/mcwork all {machine} {des_loc} {pallet}");
            this.lisDisplayCommand.Items.Add("-------------------------------------");


            this.lisDisplayMcLists.Items.Add("<<== Machines ==>>");
            this.lisDisplayEvents.Items.Add("<<== Events ==>>");

            this.wkDisplay.RunWorkerAsync();
        }


        private List<string> McCode_ReadDeives = new List<string>();


        private void lisDisplayEvents_Add(string txt)
        {
            if (this.lisDisplayEvents.IsHandleCreated)
            {
                this.lisDisplayEvents.Invoke((MethodInvoker)(() => {
                    this.lisDisplayEvents.Items.Add(txt);
                }));
            }
        }

        private bool show_log_plc = false;
        private char ping_clock = '\\';
        private void wkDisplay_DoWork(object sender, DoWorkEventArgs e)
        {
            float _ini = 0;
            float _maxinit = 10;

            try
            {

                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) Database.Initial Connecting..."));
                StaticValueManager.GetInstant().LoadAll();
                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) Database.Initial Connected!!!"));

                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadMcRuntime.Initial Connecting..."));
                ThreadMcRuntime.GetInstant().Initial();
                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadMcRuntime.Initial Connected!!!"));

                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadWorkRuntime.Initial Connecting..."));
                ThreadWorkRuntime.GetInstant().Initial();
                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadWorkRuntime.Initial Connected!!!"));

                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadAPIFileRuntime.Initial Connecting..."));
                ThreadAPIFileRuntime.GetInstant().Initial();
                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadAPIFileRuntime.Initial Connected!!!"));

                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadWakeUp.Initial Connecting..."));
                ThreadWakeUp.GetInstant().Initial();
                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > (" + (int)(_ini++ / _maxinit * 100.0f) + "%) ThreadWakeUp.Initial Connected!!!"));

                if (this.IsHandleCreated)
                {
                    this.chkMcList.Invoke((MethodInvoker)(() => {
                        Controller.McRuntimeController.GetInstant().ListMcRuntime()
                        .ForEach(x =>
                        {
                            this.chkMcList.Items.Add(x.Code);
                            this.chkMcList.SetItemChecked(this.chkMcList.Items.Count - 1, true);
                        });
                    }));
                }

                this.lisDisplayEvents_Add("---------------------- System Online (100%) ----------------------");
            }
            catch (Exception ex)
            {
                this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | System > [ERROR] {1}", DateTime.Now, ex.Message));
                this.lisDisplayEvents_Add("---------------------- Exception Exit ----------------------");
                return;
            }



            while (true)
            {
                if (this.IsHandleCreated)
                {
                    if (this.ping_clock == '⬤') this.ping_clock = ' ';
                    else this.ping_clock = '⬤';
                    this.lisDisplayMcLists.Invoke((MethodInvoker)(() => {
                        List<string> txts = new List<string>();
                        txts.Add("<<== Machines ==>> " + this.ping_clock);
                        foreach (string mcCode in this.chkMcList.CheckedItems)
                        {
                            var msg = DisplayController.McLists_Message(mcCode);
                            var msg2 = msg.Split("\n");
                            for(int i = 0; i < 5; i++)
                            {
                                if (i < msg2.Length)
                                    txts.Add(msg2[i]);
                                else
                                    txts.Add(string.Empty);
                            }
                            txts.Add(string.Empty);
                        }

                        for (int i = 0; i < txts.Count || i < lisDisplayMcLists.Items.Count; i++)
                        {
                            if (i < txts.Count)
                            {
                                if(i< this.lisDisplayMcLists.Items.Count)
                                    this.lisDisplayMcLists.Items[i] = txts[i];
                                else
                                    this.lisDisplayMcLists.Items.Add(txts[i]);
                            }
                            else
                            {
                                this.lisDisplayMcLists.Items.RemoveAt(i);
                                i--;
                            }
                        }
                    }));
                    this.lisDisplayEvents.Invoke((MethodInvoker)(() => {
                        this.lisDisplayEvents.Items[0] = "<<== Events ==>> " + ping_clock;
                        while (this.lisDisplayEvents.Items.Count > 25)
                            this.lisDisplayEvents.Items.RemoveAt(1);

                        foreach (var msg in DisplayController.Events_Reading())
                        {
                            this.lisDisplayEvents.Items.Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, msg));
                        }
                        int visibleItems = lisDisplayEvents.ClientSize.Height / lisDisplayEvents.ItemHeight;
                        lisDisplayEvents.TopIndex = Math.Max(lisDisplayEvents.Items.Count - visibleItems + 1, 0);
                    }));

                }

                Thread.Sleep(500);
            }
        }

        private void wkDisplay_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
        }



        private void txtCommand_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Up)
            {
                if (this.lisDisplayCommand.SelectedIndex == -1)
                    this.lisDisplayCommand.SelectedIndex = this.lisDisplayCommand.Items.Count - 1;
                else if (this.lisDisplayCommand.SelectedIndex-1 >= 0)
                    this.lisDisplayCommand.SelectedIndex = this.lisDisplayCommand.SelectedIndex- 1;
                this.txtCommand.SelectAll();
            }
            else if (e.KeyCode == Keys.Down)
            {
                if (this.lisDisplayCommand.SelectedIndex == -1)
                    this.lisDisplayCommand.SelectedIndex = 0;
                else if (this.lisDisplayCommand.SelectedIndex + 1 < this.lisDisplayCommand.Items.Count)
                    this.lisDisplayCommand.SelectedIndex = this.lisDisplayCommand.SelectedIndex + 1;
                this.txtCommand.SelectAll();
            }
            else if (e.KeyCode == Keys.Enter)
            {
                try
                {
                    string command = this.txtCommand.Text;
                    this.lisDisplayCommand.Items.Add("COMMAND > " + command);
                    int visibleItems = lisDisplayCommand.ClientSize.Height / lisDisplayCommand.ItemHeight;
                    lisDisplayCommand.TopIndex = Math.Max(lisDisplayCommand.Items.Count - visibleItems + 1, 0);

                    this.txtCommand.Text = string.Empty;

                    string[] comm = command.Split(' ');
                    if(command == "/plc")
                    {
                        this.show_log_plc = !show_log_plc;
                    }
                    else if (command.StartsWith("/"))
                    {
                        var res = new Comm_ConsoleFunction(string.Empty, new VOCriteria()).Execute(comm);
                        if (res._result.status == 0)
                            throw new Exception(res._result.message);
                        else
                            this.lisDisplayCommand.Items.AddRange(res.response.Split("\n"));
                    }
                    else
                    {
                        if (comm.Length == 1)
                        {
                            var index = this.chkMcList.Items.IndexOf(comm[0].ToUpper());
                            if (index == -1)
                                throw new Exception("ไม่พบ Machine ที่ระบุบ!");
                            if (this.IsHandleCreated)
                            {
                                this.chkMcList.Invoke((MethodInvoker)(() =>
                                {
                                    if (index != -1)
                                        this.chkMcList.SetItemChecked(index, !this.chkMcList.GetItemChecked(index));
                                }));
                            }
                        }
                        else
                        {
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
                        }

                    }
                }
                catch (Exception ex)
                {
                    this.lisDisplayCommand.Items.Add("COMMAND > ERROR : " + ex.Message);
                }
                finally
                {
                    int visibleItems = lisDisplayCommand.ClientSize.Height / lisDisplayCommand.ItemHeight;
                    lisDisplayCommand.TopIndex = Math.Max(lisDisplayCommand.Items.Count - visibleItems + 1, 0);
                }
            }
        }

        private void formAdminConsole_FormClosing(object sender, FormClosingEventArgs e)
        {
            /*this.lisDisplayEvents_Add("---------------------- System Closing ----------------------");
            ThreadWakeUp.GetInstant().Abort();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > ThreadWakeUp Abort!!!"));
            ThreadMcRuntime.GetInstant().Abort();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > ThreadMcRuntime Abort!!!"));
            ThreadAPIFileRuntime.GetInstant().Abort();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > ThreadAPIFileRuntime Abort!!!"));
            ThreadWorkRuntime.GetInstant().Abort();
            this.lisDisplayEvents_Add(string.Format("{0:hh:mm:ss:fff} | {1}", DateTime.Now, "System > ThreadWorkRuntime Abort!!!"));
            this.lisDisplayEvents_Add("---------------------- System Closed ----------------------");
            Thread.Sleep(1000);*/
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
            form.Controls.AddRange(new Control[] { lisBox });
            form.ClientSize = new Size(Math.Max(700, lisBox.Right + 10), form.ClientSize.Height);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MinimizeBox = false;
            form.MaximizeBox = false;

            DialogResult dialogResult = form.ShowDialog();
            if (dialogResult == DialogResult.OK)
            {

            }
        }
        

        private void menuMain_ItemClicked(object sender, ToolStripItemClickedEventArgs e)
        {
            if (e.ClickedItem.Text == "Command")
            {
                formConfigCommand fm = new formConfigCommand();
                fm.Show();
            }
            else if (e.ClickedItem.Text == "Storage")
            {
                formStorageView fm = new formStorageView();
                fm.Show();
            }
        }

        private void lisDisplayCommand_Click_1(object sender, EventArgs e)
        {
            string[] txt = this.lisDisplayCommand.Text.Split('>', 2);
            if (txt.Length == 2)
                this.txtCommand.Text = txt[1].Trim();
        }

        private void txtCommand_TextChanged(object sender, EventArgs e)
        {

        }

        private void lisDisplayCommand_SelectedIndexChanged(object sender, EventArgs e)
        {
            string[] txt = this.lisDisplayCommand.Text.Split('>', 2);
            if (txt.Length == 2)
                this.txtCommand.Text = txt[1].Trim();
        }

        private void lisDisplayMcLists_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void ChkMcList_Click(object sender, System.EventArgs e)
        {
            if(this.chkMcList.SelectedIndex >= 0)
            {
                var index = this.chkMcList.SelectedIndex;
                this.chkMcList.SetItemChecked(index, true);
            }
        }
    }
}
