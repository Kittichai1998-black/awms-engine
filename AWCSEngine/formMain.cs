using AMWUtil.Logger;
using AMWUtil.PropertyFile;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AWCSEngine
{
    public partial class formMain : Form
    {
        public formMain()
        {
            InitializeComponent();
        }

        public AMWLogger Logger { get; set; }
        public VOCriteria BuVO { get; set; }

        public void InitData()
        {

        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void MainForm_Load(object sender, EventArgs e)
        {

        }

        private void menuMain_ItemClicked(object sender, ToolStripItemClickedEventArgs e)
        {
            if(e.ClickedItem == this.menuMachineLayout)
            {
                formDesignMachineLayout form = new formDesignMachineLayout(this.BuVO);
                form.Show();
            }
        }
    }
}
