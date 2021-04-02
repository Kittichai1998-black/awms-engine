
namespace AWCSEngine
{
    partial class formConfigCommand
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
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(formConfigCommand));
            this.treeCMDs = new System.Windows.Forms.TreeView();
            this.imageList1 = new System.Windows.Forms.ImageList(this.components);
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.btnAddMcMap = new System.Windows.Forms.Button();
            this.btnTreeCmdActC = new System.Windows.Forms.Button();
            this.btnTreeCmdActE = new System.Windows.Forms.Button();
            this.btnRemoveMcMap = new System.Windows.Forms.Button();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.btnTreeCmdMapC = new System.Windows.Forms.Button();
            this.btnTreeCmdMapE = new System.Windows.Forms.Button();
            this.treeCMDMaps = new System.Windows.Forms.TreeView();
            this.ddlMcMsts = new System.Windows.Forms.ComboBox();
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            this.SuspendLayout();
            // 
            // treeCMDs
            // 
            this.treeCMDs.Dock = System.Windows.Forms.DockStyle.Fill;
            this.treeCMDs.ImageIndex = 3;
            this.treeCMDs.ImageList = this.imageList1;
            this.treeCMDs.Location = new System.Drawing.Point(3, 27);
            this.treeCMDs.Name = "treeCMDs";
            this.treeCMDs.SelectedImageIndex = 0;
            this.treeCMDs.Size = new System.Drawing.Size(794, 602);
            this.treeCMDs.TabIndex = 15;
            this.treeCMDs.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.treeCMDs_AfterSelect);
            this.treeCMDs.DoubleClick += new System.EventHandler(this.treeCMDs_DoubleClick);
            this.treeCMDs.KeyDown += new System.Windows.Forms.KeyEventHandler(this.treeCMDs_KeyDown);
            // 
            // imageList1
            // 
            this.imageList1.ColorDepth = System.Windows.Forms.ColorDepth.Depth8Bit;
            this.imageList1.ImageStream = ((System.Windows.Forms.ImageListStreamer)(resources.GetObject("imageList1.ImageStream")));
            this.imageList1.TransparentColor = System.Drawing.Color.Transparent;
            this.imageList1.Images.SetKeyName(0, "cmd-1.png");
            this.imageList1.Images.SetKeyName(1, "action-2x.png");
            this.imageList1.Images.SetKeyName(2, "file.png");
            this.imageList1.Images.SetKeyName(3, "add-4.png");
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.btnAddMcMap);
            this.groupBox1.Controls.Add(this.btnTreeCmdActC);
            this.groupBox1.Controls.Add(this.btnTreeCmdActE);
            this.groupBox1.Controls.Add(this.treeCMDs);
            this.groupBox1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.groupBox1.Location = new System.Drawing.Point(0, 0);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(800, 632);
            this.groupBox1.TabIndex = 18;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Command / Actions";
            // 
            // btnAddMcMap
            // 
            this.btnAddMcMap.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.btnAddMcMap.Location = new System.Drawing.Point(3, 586);
            this.btnAddMcMap.Name = "btnAddMcMap";
            this.btnAddMcMap.Size = new System.Drawing.Size(794, 43);
            this.btnAddMcMap.TabIndex = 20;
            this.btnAddMcMap.Text = ">>";
            this.btnAddMcMap.UseVisualStyleBackColor = true;
            this.btnAddMcMap.Click += new System.EventHandler(this.btnAddMcMap_Click);
            // 
            // btnTreeCmdActC
            // 
            this.btnTreeCmdActC.Location = new System.Drawing.Point(227, 0);
            this.btnTreeCmdActC.Name = "btnTreeCmdActC";
            this.btnTreeCmdActC.Size = new System.Drawing.Size(46, 33);
            this.btnTreeCmdActC.TabIndex = 22;
            this.btnTreeCmdActC.Text = "+";
            this.btnTreeCmdActC.UseVisualStyleBackColor = true;
            this.btnTreeCmdActC.Click += new System.EventHandler(this.btnTreeCmdActC_Click);
            // 
            // btnTreeCmdActE
            // 
            this.btnTreeCmdActE.Location = new System.Drawing.Point(280, 0);
            this.btnTreeCmdActE.Name = "btnTreeCmdActE";
            this.btnTreeCmdActE.Size = new System.Drawing.Size(46, 33);
            this.btnTreeCmdActE.TabIndex = 21;
            this.btnTreeCmdActE.Text = "-";
            this.btnTreeCmdActE.UseVisualStyleBackColor = true;
            this.btnTreeCmdActE.Click += new System.EventHandler(this.btnTreeCmdActEC_Click);
            // 
            // btnRemoveMcMap
            // 
            this.btnRemoveMcMap.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.btnRemoveMcMap.Location = new System.Drawing.Point(3, 586);
            this.btnRemoveMcMap.Name = "btnRemoveMcMap";
            this.btnRemoveMcMap.Size = new System.Drawing.Size(979, 43);
            this.btnRemoveMcMap.TabIndex = 21;
            this.btnRemoveMcMap.Text = "<<";
            this.btnRemoveMcMap.UseVisualStyleBackColor = true;
            this.btnRemoveMcMap.Click += new System.EventHandler(this.btnRemoveMcMap_Click);
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.btnTreeCmdMapC);
            this.groupBox2.Controls.Add(this.btnRemoveMcMap);
            this.groupBox2.Controls.Add(this.btnTreeCmdMapE);
            this.groupBox2.Controls.Add(this.treeCMDMaps);
            this.groupBox2.Controls.Add(this.ddlMcMsts);
            this.groupBox2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.groupBox2.Location = new System.Drawing.Point(0, 0);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(985, 632);
            this.groupBox2.TabIndex = 19;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Machine Command";
            // 
            // btnTreeCmdMapC
            // 
            this.btnTreeCmdMapC.Location = new System.Drawing.Point(191, 0);
            this.btnTreeCmdMapC.Name = "btnTreeCmdMapC";
            this.btnTreeCmdMapC.Size = new System.Drawing.Size(46, 33);
            this.btnTreeCmdMapC.TabIndex = 24;
            this.btnTreeCmdMapC.Text = "+";
            this.btnTreeCmdMapC.UseVisualStyleBackColor = true;
            // 
            // btnTreeCmdMapE
            // 
            this.btnTreeCmdMapE.Location = new System.Drawing.Point(244, 0);
            this.btnTreeCmdMapE.Name = "btnTreeCmdMapE";
            this.btnTreeCmdMapE.Size = new System.Drawing.Size(46, 33);
            this.btnTreeCmdMapE.TabIndex = 23;
            this.btnTreeCmdMapE.Text = "-";
            this.btnTreeCmdMapE.UseVisualStyleBackColor = true;
            // 
            // treeCMDMaps
            // 
            this.treeCMDMaps.Dock = System.Windows.Forms.DockStyle.Fill;
            this.treeCMDMaps.ImageIndex = 0;
            this.treeCMDMaps.ImageList = this.imageList1;
            this.treeCMDMaps.Location = new System.Drawing.Point(3, 60);
            this.treeCMDMaps.Name = "treeCMDMaps";
            this.treeCMDMaps.SelectedImageIndex = 0;
            this.treeCMDMaps.Size = new System.Drawing.Size(979, 569);
            this.treeCMDMaps.TabIndex = 16;
            // 
            // ddlMcMsts
            // 
            this.ddlMcMsts.Dock = System.Windows.Forms.DockStyle.Top;
            this.ddlMcMsts.FormattingEnabled = true;
            this.ddlMcMsts.Location = new System.Drawing.Point(3, 27);
            this.ddlMcMsts.Name = "ddlMcMsts";
            this.ddlMcMsts.Size = new System.Drawing.Size(979, 33);
            this.ddlMcMsts.TabIndex = 17;
            this.ddlMcMsts.SelectedIndexChanged += new System.EventHandler(this.treeCMDMaps_Load);
            // 
            // splitContainer1
            // 
            this.splitContainer1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer1.FixedPanel = System.Windows.Forms.FixedPanel.Panel1;
            this.splitContainer1.IsSplitterFixed = true;
            this.splitContainer1.Location = new System.Drawing.Point(0, 0);
            this.splitContainer1.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.splitContainer1.Name = "splitContainer1";
            // 
            // splitContainer1.Panel1
            // 
            this.splitContainer1.Panel1.Controls.Add(this.groupBox1);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.groupBox2);
            this.splitContainer1.Size = new System.Drawing.Size(1791, 632);
            this.splitContainer1.SplitterDistance = 800;
            this.splitContainer1.SplitterWidth = 6;
            this.splitContainer1.TabIndex = 22;
            // 
            // formConfigCommand
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(10F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1791, 632);
            this.Controls.Add(this.splitContainer1);
            this.Name = "formConfigCommand";
            this.Text = "formConfigCommand";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.Load += new System.EventHandler(this.formConfigCommand_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox2.ResumeLayout(false);
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TreeView treeCMDs;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.TreeView treeCMDMaps;
        private System.Windows.Forms.ComboBox ddlMcMsts;
        private System.Windows.Forms.Button btnAddMcMap;
        private System.Windows.Forms.Button btnRemoveMcMap;
        private System.Windows.Forms.Button btnTreeCmdActE;
        private System.Windows.Forms.Button btnTreeCmdActC;
        private System.Windows.Forms.Button btnTreeCmdMapC;
        private System.Windows.Forms.Button btnTreeCmdMapE;
        private System.Windows.Forms.ImageList imageList1;
        private System.Windows.Forms.SplitContainer splitContainer1;
    }
}