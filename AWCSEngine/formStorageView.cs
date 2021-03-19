using ADO.WCSStaticValue;
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
    public partial class formStorageView : Form
    {
        public formStorageView()
        {
            InitializeComponent();
        }

        private void formStorageView_Load(object sender, EventArgs e)
        {
            StaticValueManager.GetInstant().Warehouses.ForEach(wh => {
                this.ddlLV.Items.Add(wh.Code);
            });
            this.ddlLV.SelectedIndex = 0;
            this.grdLocation_ChangeWarehouse();
            this.grdLocation_ChangeLV();
        }

        private void grdLocation_ChangeLV()
        {
            var lv = this.ddlLV.Text.Split(' ')[0].Get2<int>();

            var minBank = this.Locations.Max(x => x.GetLv());
            var maxBank = this.Locations.Max(x => x.GetLv());

            var minBay = this.Locations.Max(x => x.GetLv());
            var maxBay = this.Locations.Max(x => x.GetLv());

            for (int iBay = minBay; iBay <= maxBay; iBay++)
            {
                this.grdLocation.Columns.Add(iBay.ToString(), iBay.ToString());
            }
            for (int iBank = minBank; iBank <= maxBank; iBank++)
            {
                DataGridViewRow row = new DataGridViewRow();
                for (int iBay = minBay; iBay <= maxBay; iBay++)
                {
                 //   DataGridViewCell cell = DataGridViewCell.;
                 //   cell.Value = string.Format("{0:000}{1:000}{2:000}", iBank, iBay, lv);
                 //   row.Cells.Add(cell);
                }
                this.grdLocation.Rows.Add(row);
            }
        }

        private List<acs_Location> Locations { get; set; }
        private void grdLocation_ChangeWarehouse()
        {
            var wh = StaticValueManager.GetInstant().GetWarehouse(this.ddlLV.Text);
            if (wh == null) return;

            var areas = StaticValueManager.GetInstant().Areas.FindAll(x => x.Warehouse_ID == wh.ID);
            this.Locations = StaticValueManager.GetInstant().Locations
                .Where(x => areas.Any(y => y.ID == x.Area_ID))
                //.Select(x => x.Code)
                .OrderBy(x => x.Code)
                .ToList();

            var minLV = this.Locations.Min(x => x.GetLv());
            var maxLV = this.Locations.Max(x => x.GetLv());

            this.ddlLV.Items.Clear();
            for (int i = minLV; i <= maxLV; i++)
            {
                this.ddlLV.Items.Add("Lv " + i);
            }
            this.ddlLV.SelectedIndex = 0;

        }
    }
}
