using AMWUtil.Common;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Reflection;
using System.Text;
using System.Windows.Forms;

namespace AWCSEngine
{
    public partial class formDesignMachineLayout : Form
    {
        VOCriteria BuVO { get; set; }
        public formDesignMachineLayout(VOCriteria buVO)
        {
            this.BuVO = buVO;
            InitializeComponent();
        }

        private void formDesignMachineLayout_Load(object sender, EventArgs e)
        {
            //var dataADO = ADO.WCSDB.DataADO.GetInstant().CreateTransaction();
            try
            {
                this.splitContainer1.SplitterDistance = this.splitContainer1.Height - 300;
                this.splitContainer2.SplitterDistance = this.splitContainer2.Width - 400;
                panelDesign_Reload();
            }
            finally
            {
              //  dataADO.Commit();
              //  dataADO.Connection.Close();
            }


        }

        private void btnSetSizeWH_Click(object sender, EventArgs e)
        {
            panelDesign_Reload();
        }

        const int blockSize = 30;
        public void panelDesign_Reload()
        {

        }

        private void splitContainer1_Panel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void btnAddGroup_Click(object sender, EventArgs e)
        {
            
        }
    }
}
