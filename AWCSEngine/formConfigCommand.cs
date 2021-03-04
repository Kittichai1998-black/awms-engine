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


            this.Cmds = DataADO.GetInstant().SelectByActive<acs_McCommand>(null);
            this.CmdActs = DataADO.GetInstant().SelectByActive<acs_McCommandAction>(null);
            this.CmdMcs = DataADO.GetInstant().SelectByActive<acs_McCommandMcMaster>(null);

            this.treeCMDs_Load();
        }

        private void treeCMDs_Load()
        {
            this.treeCMDs.Nodes.Clear();
            EnumUtil.ListKeyValuesInt<McCommandType>()
                .OrderBy(x => x.Value)
                .ToList()
                .ForEach(cmd_gb =>
                {
                    var nodeGB = new TreeNode($"Plc.{cmd_gb.Value} : {cmd_gb.Key}");
                    this.treeCMDs.Nodes.Add(nodeGB);
                    this.Cmds
                        .FindAll(cmd => (int)cmd.McCommandType == cmd_gb.Value)
                        .ForEach(cmd =>
                        {
                            var nodeCmd = new TreeNode($"Cmd.{cmd.ID} : {cmd.Code}");
                            nodeGB.Nodes.Add(nodeCmd);
                            this.CmdActs.FindAll(cmdAct => cmdAct.McCommand_ID == cmd.ID)
                            .OrderBy(cmdAct => cmdAct.Seq)
                            .ToList()
                            .ForEach(cmdAct =>
                            {
                                var nodeCmdAct = new TreeNode($"Act.{cmdAct.ID} : {cmdAct.DKV_Condition} >> {cmdAct.DKV_Set}");
                                nodeCmd.Nodes.Add(nodeCmdAct);
                            });
                            nodeCmd.Nodes.Add("<<Add Action>>");
                        });

                    nodeGB.Nodes.Add("<<Add Command>>");
                });
        }

        private void ddlMcMsts_SelectedIndexChanged(object sender, EventArgs e)
        {
            this.treeCMDMaps.Nodes.Clear();
            if(this.ddlMcMsts.SelectedItem != null)
            {
                this.CmdMcs.FindAll(cmdMc => cmdMc.McMaster_ID == (int)((dynamic)this.ddlMcMsts.SelectedItem).Value)
                    .OrderBy(x=>x.McCommand_ID)
                    .ToList()
                    .ForEach(cmdMc =>
                    {
                        var cmd = this.Cmds.First(x => x.ID == cmdMc.McCommand_ID);
                        var nodeCmd = new TreeNode($"Map.{cmdMc.ID} : {cmd.Code} (Plc.{(int)cmd.McCommandType})");
                        this.treeCMDMaps.Nodes.Add(nodeCmd);
                        this.CmdActs.FindAll(cmdAct => cmdAct.McCommand_ID == cmd.ID)
                        .OrderBy(cmdAct => cmdAct.Seq)
                        .ToList()
                        .ForEach(cmdAct =>
                        {
                            var nodeCmdAct = new TreeNode($"Act.{cmdAct.ID} : {cmdAct.DKV_Condition} >> {cmdAct.DKV_Set}");
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
            if (e.KeyCode == Keys.Enter)
            {
                string inpTxt = string.Empty;
                var tv = (TreeView)sender;
                if (tv.SelectedNode.Text.StartsWith("Cmd."))
                {
                    if (InputBox("Update Command Code", "acs_McCommand.Code", ref inpTxt) == DialogResult.OK)
                    {
                        int inpID = tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim().Get2<int>();
                        //ADO.WCSDB.DataADO.GetInstant().UpdateByID<acs_McCommand>()
                    }
                }
                else if (tv.SelectedNode.Text.StartsWith("<<Add Command>>"))
                {
                    MessageBox.Show("Add Command");
                }
                else if (tv.SelectedNode.Text.StartsWith("Act."))
                {
                    MessageBox.Show("Edit Action : " + tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim());
                }
                else if (tv.SelectedNode.Text.StartsWith("<<Add Action>>"))
                {
                    MessageBox.Show("Add Action");
                }
            }
            else if (e.KeyCode == Keys.Delete)
            {
                var tv = (TreeView)sender;
                if (tv.SelectedNode.Text.StartsWith("Cmd."))
                {
                    MessageBox.Show("Delete Command : " + tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim());
                }
                else if (tv.SelectedNode.Text.StartsWith("Act."))
                {
                    MessageBox.Show("Delete Action : " + tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim());
                }
                else if (tv.SelectedNode.Text.StartsWith("Map."))
                {
                    MessageBox.Show("Delete Map : " + tv.SelectedNode.Text.Split(":")[0].Split(".")[1].Trim());
                }
            }
        }


        public static DialogResult InputBox(string title, string promptText, ref string value)
        {
            Form form = new Form();
            Label label = new Label();
            TextBox textBox = new TextBox();
            Button buttonOk = new Button();
            Button buttonCancel = new Button();

            form.Text = title;
            label.Text = promptText;
            textBox.Text = value;

            buttonOk.Text = "OK";
            buttonCancel.Text = "Cancel";
            buttonOk.DialogResult = DialogResult.OK;
            buttonCancel.DialogResult = DialogResult.Cancel;

            label.Location = new Point(5, 5);
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
            value = textBox.Text;
            return dialogResult;
        }
    }
}
