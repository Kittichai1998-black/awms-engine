using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
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
        private List<acs_McCommandMcMaster> CmdMsts;

        private void formConfigCommand_Load(object sender, EventArgs e)
        {

            this.ddlMcMsts.Items.AddRange(StaticValueManager.GetInstant().McMasters.ToArray());
            this.ddlMcMsts.DisplayMember = "Code";
            this.ddlMcMsts.ValueMember = "ID";

            this.ddlCmdTypes.Items.AddRange(EnumUtil.ListKeyValuesInt<McCommandType>()
                .Select(x => new { Key = x.Key, Value = x.Value })
                .ToArray());
            this.ddlCmdTypes.DisplayMember = "Key";
            this.ddlCmdTypes.ValueMember = "Value";

            this.Cmds = DataADO.GetInstant().SelectByActive<acs_McCommand>(null);
            this.CmdActs = DataADO.GetInstant().SelectByActive<acs_McCommandAction>(null);

        }

        private void ddlCmdTypes_SelectedIndexChanged(object sender, EventArgs e)
        {
            this.treeCMDs.Nodes.Clear();
            if (this.ddlCmdTypes.SelectedItem != null)
            {
                this.Cmds
                    .FindAll(cmd => (int)cmd.McCommandType == (int)((dynamic)this.ddlCmdTypes.SelectedItem).Value)
                    .ForEach(cmd =>
                    {
                        var nodeCmd = new TreeNode(cmd.ID + ") " + cmd.Code + " : " + cmd.Name);
                        this.treeCMDs.Nodes.Add(nodeCmd);
                        this.CmdActs.FindAll(cmdAct => cmdAct.McCommand_ID == cmd.ID).ForEach(cmdAct =>
                        {
                            var nodeCmdAct = new TreeNode(cmdAct.ID + ") " + cmdAct.DKV_Condition + " >> " + cmdAct.DKV_Set);
                            nodeCmd.Nodes.Add(nodeCmdAct);
                        });
                    });
            }
        }

        private void ddlMcMsts_SelectedIndexChanged(object sender, EventArgs e)
        {
            this.treeCMDMaps.Nodes.Clear();
            if(this.ddlMcMsts.SelectedValue != null)
            {
                this.CmdMsts.FindAll(cmdMst => cmdMst.McMaster_ID == (int)this.ddlMcMsts.SelectedItem)
                    .ForEach(cmdMst =>
                    {

                    });
                var nodeCMD = new TreeNode();
            }
        }
    }
}
