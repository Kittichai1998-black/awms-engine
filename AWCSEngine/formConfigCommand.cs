using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace AWCSEngine
{
    public partial class formConfigCommand : Form
    {
        public formConfigCommand()
        {
            InitializeComponent();
        }
        private List<acs_McCommand> Cmds;
        private List<acs_McCommandAction> CmdActs;
        private List<acs_McCommandMcMaster> CmdMcs;

        private void formConfigCommand_Load(object sender, EventArgs e)
        {

            this.ddlMcMsts.Items.AddRange(StaticValueManager.GetInstant().McMasters.Select(x=>new { Key=x.Code,Value=x.ID.Value }).ToArray());
            this.ddlMcMsts.DisplayMember = "Key";
            this.ddlMcMsts.ValueMember = "Value";


            this.Cmds = DataADO.GetInstant().ListByActive<acs_McCommand>(null);
            this.CmdActs = DataADO.GetInstant().ListByActive<acs_McCommandAction>(null);
            this.CmdMcs = DataADO.GetInstant().ListByActive<acs_McCommandMcMaster>(null);

            this.treeCMDs_Load(null,null);
            this.ddlMcMsts.SelectedIndex = 0;
        }

        private void treeCMDs_Load(object sender, EventArgs e)
        {
            this.treeCMDs.Nodes.Clear();
            var enumList = EnumUtil.ListAttDisplayValuesInt<McCommandType>();
            enumList
                .OrderBy(x => x.Value)
                .ToList()
                .ForEach(cmd_gb =>
                {
                    var nodeGB = new TreeNode($"Plc.{cmd_gb.Value} : {cmd_gb.Key}",0,0);
                    this.treeCMDs.Nodes.Add(nodeGB);
                    this.Cmds
                        .FindAll(cmd => (int)cmd.McCommandType == cmd_gb.Value)
                        .ForEach(cmd =>
                        {
                            var nodeCmd = new TreeNode($"Cmd.{cmd.ID} : {cmd.Code}",1,1);
                            nodeGB.Nodes.Add(nodeCmd);
                            this.CmdActs.FindAll(cmdAct => cmdAct.McCommand_ID == cmd.ID)
                            .OrderBy(cmdAct => cmdAct.Seq)
                            .ToList()
                            .ForEach(cmdAct =>
                            {
                                var nodeCmdAct = new TreeNode($"Act.{cmdAct.ID} : {cmdAct.Seq} >> {cmdAct.DKV_Condition} >> {cmdAct.DKV_Set}",2,2);
                                nodeCmd.Nodes.Add(nodeCmdAct);
                            });
                            nodeCmd.Nodes.Add(new TreeNode("<<Add Action>>", 3, 3));
                        });

                    nodeGB.Nodes.Add(new TreeNode("<<Add Command>>", 3, 3));
                });
        }

        private void treeCMDMaps_Load(object sender, EventArgs e)
        {
            this.treeCMDMaps.Nodes.Clear();
            if(this.ddlMcMsts.SelectedItem != null)
            {
                long mcID = (long)((dynamic)this.ddlMcMsts.SelectedItem).Value;
                this.CmdMcs.FindAll(cmdMc => cmdMc.McMaster_ID == mcID)
                    .OrderBy(x=>x.McCommand_ID)
                    .ToList()
                    .ForEach(cmdMc =>
                    {
                        var cmd = this.Cmds.First(x => x.ID == cmdMc.McCommand_ID);
                        var nodePlc = new TreeNode($"Plc.{(int)cmd.McCommandType} : {cmd.McCommandType.ToString()}", 0, 0);
                        var nodeCmd = new TreeNode($"Cmd.{cmd.ID} : {cmd.McCommandType.ToString()}", 1, 1);
                        nodePlc.Nodes.Add(nodeCmd);

                        this.treeCMDMaps.Nodes.Add(nodePlc);
                        this.CmdActs.FindAll(cmdAct => cmdAct.McCommand_ID == cmd.ID)
                        .OrderBy(cmdAct => cmdAct.Seq)
                        .ToList()
                        .ForEach(cmdAct =>
                        {
                            var nodeCmdAct = new TreeNode($"Act.{cmdAct.ID} : {cmdAct.Seq} >> {cmdAct.DKV_Condition} >> {cmdAct.DKV_Set}", 2, 2);
                            nodeCmd.Nodes.Add(nodeCmdAct);
                        });
                    });
            }
        }

        private void btnTreeCmdActEC_Click(object sender, EventArgs e)
        {
            this.treeCMDs.ExpandAll();
        }

        private void btnTreeCmdActC_Click(object sender, EventArgs e)
        {
            this.treeCMDs.CollapseAll();
        }

        private void treeCMDs_KeyDown(object sender, KeyEventArgs e)
        {
            try
            {

                string inpVal0 = string.Empty;
                string inpVal1 = string.Empty;
                string inpVal2 = string.Empty;
                long inpID = 0;
                if (e.KeyCode == Keys.Enter)
                {
                    var tv = (TreeView)sender;
                    if (tv.SelectedNode.Text.StartsWith("Cmd."))//UPDATE
                    {
                        inpVal1 = tv.SelectedNode.Text.Split(":")[1].Trim();
                        if (InputBox1("Update McCommand.Code", "Code", ref inpVal1) == DialogResult.OK)
                        {
                            inpID = tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
                            ADO.WCSDB.DataADO.GetInstant()
                                .UpdateByID<acs_McCommand>(
                                inpID,
                                ListKeyValue<string, object>.New("Code", inpVal1),
                                null);
                            tv.SelectedNode.Text = $"Cmd.{inpID} : {inpVal1}";
                            this.Cmds = DataADO.GetInstant().ListByActive<acs_McCommand>(null);
                        }
                    }
                    else if (tv.SelectedNode.Text.StartsWith("Act."))
                    {
                        inpVal0 = tv.SelectedNode.Text.Split(":")[1].Split(">>")[0].Trim();
                        inpVal1 = tv.SelectedNode.Text.Split(":")[1].Split(">>")[1].Trim();
                        inpVal2 = tv.SelectedNode.Text.Split(":")[1].Split(">>")[2].Trim();
                        if (InputBox2("Update McCommandAction", "Seq", "DK_Condition", "DK_Set", ref inpVal0, ref inpVal1, ref inpVal2) == DialogResult.OK)
                        {
                            inpID = tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
                            ADO.WCSDB.DataADO.GetInstant()
                                .UpdateByID<acs_McCommandAction>(
                                inpID,
                                ListKeyValue<string, object>
                                    .New("Seq", inpVal0.Get2<int>())
                                    .Add("DKV_Condition", inpVal1)
                                    .Add("DKV_Set", inpVal2),
                                null);
                            tv.SelectedNode.Text = $"Act.{inpID} : {inpVal0} >> {inpVal1} >> {inpVal2}";
                            this.CmdActs = DataADO.GetInstant().ListByActive<acs_McCommandAction>(null);
                        }
                    }
                    else if (tv.SelectedNode.Text.StartsWith("<<Add Command>>"))//ADD
                    {
                        if (InputBox1("Add McCommand", "Code", ref inpVal1) == DialogResult.OK)
                        {
                            int parrentID = tv.SelectedNode.Parent.Text.Split(":")[0].Split(".")[1].Trim().Get2<int>();
                            inpID = ADO.WCSDB.DataADO.GetInstant()
                                .Insert<acs_McCommand>(
                                ListKeyValue<string, object>
                                    .New("Code", inpVal1)
                                    .Add("Name", "")
                                    .Add("Status", EntityStatus.ACTIVE)
                                    .Add("McCommandType", parrentID),
                                null).Value;
                            tv.SelectedNode.Text = $"Cmd.{inpID} : {inpVal1}";
                            tv.SelectedNode.ImageIndex = 1;
                            tv.SelectedNode.SelectedImageIndex = 1;
                            var newNodeAct = new TreeNode("<<Add Action>>", 3, 3);
                            tv.SelectedNode.Nodes.Add(newNodeAct);
                            var newNode = new TreeNode("<<Add Command>>", 3, 3);
                            tv.SelectedNode.Parent.Nodes.Add(newNode);
                            this.Cmds = DataADO.GetInstant().ListByActive<acs_McCommand>(null);
                        }
                    }

                    else if (tv.SelectedNode.Text.StartsWith("<<Add Action>>"))//ADD
                    {
                        if (InputBox2("Insert McCommandAction", "Seq", "DK_Condition", "DK_Set", ref inpVal0, ref inpVal1, ref inpVal2) == DialogResult.OK)
                        {
                            long parentInpID = tv.SelectedNode.Parent.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
                            inpID = ADO.WCSDB.DataADO.GetInstant()
                                .Insert<acs_McCommandAction>(
                                ListKeyValue<string, object>
                                    .New("Seq", inpVal0.Get2<int>())
                                    .Add("DKV_Condition", inpVal1)
                                    .Add("DKV_Set", inpVal2)
                                    .Add("McCommand_ID", parentInpID)
                                    .Add("Status", EntityStatus.ACTIVE),
                                null).Value;
                            tv.SelectedNode.Text = $"Act.{inpID} : {inpVal0} >> {inpVal1} >> {inpVal2}";
                            tv.SelectedNode.ImageIndex = 2;
                            tv.SelectedNode.SelectedImageIndex = 2;
                            var newNode = new TreeNode("<<Add Action>>", 3, 3);
                            tv.SelectedNode.Parent.Nodes.Add(newNode);
                            this.CmdActs = DataADO.GetInstant().ListByActive<acs_McCommandAction>(null);
                        }
                    }
                }
                else if (e.KeyCode == Keys.Delete)
                {
                    var tv = (TreeView)sender;
                    if (tv.SelectedNode.Text.StartsWith("Cmd."))
                    {
                        if (MessageBox.Show($"Confrim Remove Command?", $"Remove '{tv.SelectedNode.Text}'", MessageBoxButtons.OKCancel) == DialogResult.OK)
                        {
                            inpID = tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
                            ADO.WCSDB.DataADO.GetInstant()
                                .UpdateByID<acs_McCommand>(
                                    inpID,
                                    ListKeyValue<string, object>.New("Status", EntityStatus.REMOVE),
                                    null);
                            tv.SelectedNode.Remove();
                            this.Cmds = DataADO.GetInstant().ListByActive<acs_McCommand>(null);
                        }
                    }
                    else if (tv.SelectedNode.Text.StartsWith("Act."))
                    {
                        if (MessageBox.Show($"Confrim Remove CommandAction?", $"Remove '{tv.SelectedNode.Text}'", MessageBoxButtons.OKCancel) == DialogResult.OK)
                        {
                            inpID = tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
                            ADO.WCSDB.DataADO.GetInstant()
                                .UpdateByID<acs_McCommandAction>(
                                    inpID,
                                    ListKeyValue<string, object>.New("Status", EntityStatus.REMOVE),
                                    null);
                            tv.SelectedNode.Remove();
                            this.CmdActs = DataADO.GetInstant().ListByActive<acs_McCommandAction>(null);
                        }
                    }
                    else if (tv.SelectedNode.Text.StartsWith("Map."))
                    {
                        if (MessageBox.Show($"Confrim Remove CommandMapping?", $"Remove '{tv.SelectedNode.Text}'", MessageBoxButtons.OKCancel) == DialogResult.OK)
                        {
                            inpID = tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
                            ADO.WCSDB.DataADO.GetInstant()
                                .UpdateByID<acs_McCommandMcMaster>(
                                    inpID,
                                    ListKeyValue<string, object>.New("Status", EntityStatus.REMOVE),
                                    null);
                            tv.SelectedNode.Remove();
                            this.CmdMcs = DataADO.GetInstant().ListByActive<acs_McCommandMcMaster>(null);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show( ex.Message + "\n---------------------------\n" + ex.StackTrace, "ERROR", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }


        public DialogResult InputBox1(string title, string promptText, ref string value1)
        {
            Form form = new Form();
            Label label = new Label();
            TextBox textBox = new TextBox();
            Button buttonOk = new Button();
            Button buttonCancel = new Button();

            form.Text = title;
            label.Text = promptText;
            textBox.Text = value1;

            buttonOk.Text = "OK";
            buttonCancel.Text = "Cancel";
            buttonOk.DialogResult = DialogResult.OK;
            buttonCancel.DialogResult = DialogResult.Cancel;

            label.Location = new Point(5, 5);
            label.AutoSize = true;
            textBox.Location = new Point(5, 35);
            textBox.Width = 280;
            buttonOk.Location = new Point(15, 75);
            buttonOk.AutoSize = true;
            buttonCancel.Location = new Point(100, 75);
            buttonCancel.AutoSize = true;

            form.ClientSize = new Size(396, 127);
            form.Controls.AddRange(new Control[] { label, textBox, buttonOk, buttonCancel });
            form.ClientSize = new Size(Math.Max(300, label.Right + 10), form.ClientSize.Height);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MinimizeBox = false;
            form.MaximizeBox = false;
            form.AcceptButton = buttonOk;
            form.CancelButton = buttonCancel;

            DialogResult dialogResult = form.ShowDialog();
            value1 = textBox.Text;
            value1 = value1.Trim();
            if (string.IsNullOrEmpty(value1)) { MessageBox.Show("Value is Empty!"); return DialogResult.Cancel; }
            return dialogResult;
        }
        public DialogResult InputBox2(string title, string promptText0, string promptText1, string promptText2,
            ref string value0, ref string value1, ref string value2)
        {
            Form form = new Form();
            Label label0 = new Label();
            Label label1 = new Label();
            Label label2 = new Label();
            TextBox textBox0 = new TextBox();
            TextBox textBox1 = new TextBox();
            TextBox textBox2 = new TextBox();
            Button buttonOk = new Button();
            Button buttonCancel = new Button();

            form.Text = title;
            label0.Text = promptText0;
            label1.Text = promptText1;
            label2.Text = promptText2;
            textBox0.Text = value0;
            textBox1.Text = value1;
            textBox2.Text = value2;

            buttonOk.Text = "OK";
            buttonCancel.Text = "Cancel";
            buttonOk.DialogResult = DialogResult.OK;
            buttonCancel.DialogResult = DialogResult.Cancel;

            label0.Location = new Point(5, 5);
            label0.AutoSize = true;
            textBox0.Location = new Point(5, 35);
            textBox0.Width = 1180;
            label1.Location = new Point(5, 65);
            label1.AutoSize = true;
            textBox1.Location = new Point(5, 95);
            textBox1.Width = 1180;
            label2.Location = new Point(5, 125);
            label2.AutoSize = true;
            textBox2.Location = new Point(5, 155);
            textBox2.Width = 1180;
            buttonOk.Location = new Point(15, 195);
            buttonOk.AutoSize = true;
            buttonCancel.Location = new Point(100, 195);
            buttonCancel.AutoSize = true;

            form.ClientSize = new Size(1250, 247);
            form.Controls.AddRange(new Control[] {label0,textBox0, label1, textBox1,label2, textBox2, buttonOk, buttonCancel });
            form.ClientSize = new Size(Math.Max(1000, label1.Right + 10), form.ClientSize.Height);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MinimizeBox = false;
            form.MaximizeBox = false;
            form.AcceptButton = buttonOk;
            form.CancelButton = buttonCancel;

            DialogResult dialogResult = form.ShowDialog();
            value0 = textBox0.Text;
            value1 = textBox1.Text;
            value2 = textBox2.Text;
            value0 = value0.Trim();
            value1 = value1.Trim();
            value2 = value2.Trim();
            if (dialogResult == DialogResult.OK)
                if (string.IsNullOrEmpty(value0) || string.IsNullOrEmpty(value1) || string.IsNullOrEmpty(value2))
                {
                    MessageBox.Show("Value is Empty!"); return DialogResult.Cancel;
                }
            return dialogResult;
        }

        private void treeCMDs_AfterSelect(object sender, TreeViewEventArgs e)
        {
            //TreeView tv = (TreeView)sender;
            //tv.SelectedImageIndex = tv.SelectedNode.ImageIndex;
        }

        private void btnAddMcMap_Click(object sender, EventArgs e)
        {
            TreeNode cmdTv = null;
            if (this.treeCMDs.SelectedNode.Text.StartsWith("Cmd."))
            {
                cmdTv = this.treeCMDs.SelectedNode;
            }
            else if (this.treeCMDs.SelectedNode.Text.StartsWith("Act."))
            {
                cmdTv = this.treeCMDs.SelectedNode.PrevNode;
            }
            if (cmdTv == null) return;

            long cmdID = cmdTv.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
            long mcID = (long)((dynamic)this.ddlMcMsts.SelectedItem).Value;

            var cmd = this.Cmds.FirstOrDefault(x => x.ID == cmdID);
            if(this.CmdMcs
                .FindAll(cmdMc => cmdMc.McMaster_ID == mcID)
                .Select(x=>this.Cmds.First(y=>y.ID==x.McCommand_ID))
                .Any(x=>x.McCommandType == cmd.McCommandType))
            {
                MessageBox.Show("PLC Command Duplicate!", $"PLC Command = '{cmd.McCommandType}'", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            DataADO.GetInstant().Insert<acs_McCommandMcMaster>(
                new acs_McCommandMcMaster {
                    McCommand_ID = cmdID,
                    McMaster_ID = mcID,
                    Status = EntityStatus.ACTIVE
                }, null);
            this.CmdMcs = DataADO.GetInstant().ListByActive<acs_McCommandMcMaster>(null);
            this.treeCMDMaps_Load(null, null);
        }

        private void btnRemoveMcMap_Click(object sender, EventArgs e)
        {
            TreeNode cmdTv = null;
            if (this.treeCMDMaps.SelectedNode.Text.StartsWith("Plc."))
            {
                cmdTv = this.treeCMDMaps.SelectedNode.Nodes[0];
            }
            else if (this.treeCMDMaps.SelectedNode.Text.StartsWith("Cmd."))
            {
                cmdTv = this.treeCMDMaps.SelectedNode;
            }
            else if (this.treeCMDMaps.SelectedNode.Text.StartsWith("Act."))
            {
                cmdTv = this.treeCMDMaps.SelectedNode.PrevNode;
            }
            if (cmdTv == null) return;

            long cmdID = cmdTv.Text.Split(":")[0].Split(".")[1].Trim().Get2<long>();
            long mcID = (long)((dynamic)this.ddlMcMsts.SelectedItem).Value;
            acs_McCommandMcMaster upd = this.CmdMcs.First(x => x.McMaster_ID == mcID && x.McCommand_ID == cmdID);
            upd.Status = EntityStatus.REMOVE;
            DataADO.GetInstant().UpdateBy<acs_McCommandMcMaster>(upd , null);
            this.CmdMcs = DataADO.GetInstant().ListByActive<acs_McCommandMcMaster>(null);
            this.treeCMDMaps_Load(null, null);
        }
    }
}
