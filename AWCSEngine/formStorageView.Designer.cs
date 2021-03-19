
namespace AWCSEngine
{
    partial class formStorageView
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.grdLocation = new System.Windows.Forms.DataGridView();
            this.ddlLV = new System.Windows.Forms.ComboBox();
            this.txtSearch = new System.Windows.Forms.TextBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.ddlWH = new System.Windows.Forms.ComboBox();
            ((System.ComponentModel.ISupportInitialize)(this.grdLocation)).BeginInit();
            this.panel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // grdLocation
            // 
            this.grdLocation.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.grdLocation.Dock = System.Windows.Forms.DockStyle.Fill;
            this.grdLocation.Location = new System.Drawing.Point(0, 0);
            this.grdLocation.Name = "grdLocation";
            this.grdLocation.RowHeadersWidth = 62;
            this.grdLocation.RowTemplate.Height = 33;
            this.grdLocation.Size = new System.Drawing.Size(1211, 656);
            this.grdLocation.TabIndex = 0;
            // 
            // ddlLV
            // 
            this.ddlLV.Dock = System.Windows.Forms.DockStyle.Right;
            this.ddlLV.FormattingEnabled = true;
            this.ddlLV.Location = new System.Drawing.Point(1029, 0);
            this.ddlLV.Name = "ddlLV";
            this.ddlLV.Size = new System.Drawing.Size(182, 33);
            this.ddlLV.TabIndex = 2;
            // 
            // txtSearch
            // 
            this.txtSearch.Dock = System.Windows.Forms.DockStyle.Left;
            this.txtSearch.Location = new System.Drawing.Point(0, 0);
            this.txtSearch.Name = "txtSearch";
            this.txtSearch.Size = new System.Drawing.Size(662, 31);
            this.txtSearch.TabIndex = 3;
            // 
            // panel1
            // 
            this.panel1.BackColor = System.Drawing.SystemColors.Desktop;
            this.panel1.Controls.Add(this.ddlWH);
            this.panel1.Controls.Add(this.txtSearch);
            this.panel1.Controls.Add(this.ddlLV);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(1211, 43);
            this.panel1.TabIndex = 4;
            // 
            // ddlWH
            // 
            this.ddlWH.Dock = System.Windows.Forms.DockStyle.Right;
            this.ddlWH.FormattingEnabled = true;
            this.ddlWH.Location = new System.Drawing.Point(847, 0);
            this.ddlWH.Name = "ddlWH";
            this.ddlWH.Size = new System.Drawing.Size(182, 33);
            this.ddlWH.TabIndex = 4;
            // 
            // formStorageView
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(10F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1211, 656);
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.grdLocation);
            this.Name = "formStorageView";
            this.Text = "formStorageView";
            this.Load += new System.EventHandler(this.formStorageView_Load);
            ((System.ComponentModel.ISupportInitialize)(this.grdLocation)).EndInit();
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.DataGridView grdLocation;
        private System.Windows.Forms.ComboBox ddlLV;
        private System.Windows.Forms.TextBox txtSearch;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.ComboBox ddlWH;
    }
}