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
            this.grdLocation.Rows.Clear();
            var iLv = this.ddlLV.Text.Split(' ')[0].Get2<int>();

            for (int iBay = 0; iBay <= this._Locations.Length; iBay++)
            {
                DataGridViewRow row = new DataGridViewRow();
                for (int iBank = 0; iBank <= this._Locations[iBank].Length; iBank++)
                {
                    string code = string.Format("{0:000}{1:000}{2:000}", iBank, iBay, iLv);
                    row.Cells[iBay].Value = code;
                    if (this._Locations[iBay][iBank][iLv] == null)
                    {
                        row.Cells[iBay].Style.BackColor = Color.Black;
                    }
                    else if (!string.IsNullOrEmpty(this._Locations[iBay][iBank][iLv].ProdCode))
                    {
                        row.Cells[iBay].Value = this._Locations[iBay][iBank][iLv].ProdCode;
                        row.Cells[iBay].Style.BackColor = Color.LightGreen;
                    }
                    else
                    {
                        row.Cells[iBay].Value = this._Locations[iBay][iBank][iLv].LocCode;
                        row.Cells[iBay].Style.BackColor = Color.White;
                    }
                
                }
                this.grdLocation.Rows.Add(row);
            }
        }

        private class TLoc
        {
            public string LocCode;
            public string ProdCode;
        }
        private TLoc[][][] _Locations { get; set; }
        private void grdLocation_ChangeWarehouse()
        {
            var wh = StaticValueManager.GetInstant().GetWarehouse(this.ddlLV.Text);
            if (wh == null) return;

            var areas = StaticValueManager.GetInstant().Areas.FindAll(x => x.Warehouse_ID == wh.ID);
            var locs = StaticValueManager.GetInstant().Locations
                .Where(x => areas.Any(y => y.ID == x.Area_ID))
                //.Select(x => x.Code)
                .OrderBy(x => x.Code)
                .ToList();
            var baseObjs =
                DataADO.GetInstant().SelectBy<act_BaseObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Area_ID", areas.Select(x=>x.ID.Value).ToArray(), SQLOperatorType.IN)
            }, null);


            var minLV = locs.Min(x => x.GetLv());
            var maxLV = locs.Max(x => x.GetLv());
            var maxBay = locs.Max(x => x.GetBay());
            var maxBank = locs.Max(x => x.GetBank());
            this._Locations = new TLoc[maxBay][][];
            for (int i1 =0;i1 < this._Locations.Length; i1++)
            {
                this._Locations[i1] = new TLoc[maxBank][];
                for (int i2 = 0; i1 < this._Locations.Length; i1++)
                {
                    this._Locations[i1][i2] = new TLoc[maxLV];
                }
            }
            foreach (var l in locs)
            {
                try
                {
                    var b = baseObjs.FirstOrDefault(x => x.Location_ID == l.ID);
                    this._Locations[l.GetBay()][l.GetBank()][l.GetLv()] = new TLoc { LocCode = l.Code, ProdCode = (b == null ? string.Empty : b.SkuLot) };
                }
                catch { }
            }

            this.ddlLV.Items.Clear();
            for (int i = minLV; i <= maxLV; i++)
            {
                this.ddlLV.Items.Add("Lv " + i);
            }
            this.ddlLV.SelectedIndex = 0;


            this.grdLocation.Rows.Clear();
            this.grdLocation.Columns.Clear();
            for (int iBay = 0; iBay < this._Locations.Length; iBay++)
            {
                this.grdLocation.Columns.Add((iBay + 1).ToString(), (iBay + 1).ToString());
            }
        }
    }
}
