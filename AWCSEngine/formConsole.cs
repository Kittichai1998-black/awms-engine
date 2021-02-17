﻿using AMSModel.Constant.EnumConst;
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
                        this.lisDisplayEngine.Items.AddRange(McController.GetInstant().ListMessageLog());
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
                        Controller.McController.GetInstant().Command(
                            comm[0],
                            AMWUtil.Common.EnumUtil.GetValueEnum<McCommand>(comm[1]),
                            comm.Length >= 3 ? comm[2] : string.Empty,
                            comm.Length >= 4 ? comm[3] : string.Empty);
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
