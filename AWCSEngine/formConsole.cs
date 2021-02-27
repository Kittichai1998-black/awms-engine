using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
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
                            (x) => {
                                var msg = comm[0] + " " + comm[1] + " > " + x.McObj.EventStatus.ToString();
                                this.lisDisplayCommand.Items.Insert(0, msg);
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
    }
}
